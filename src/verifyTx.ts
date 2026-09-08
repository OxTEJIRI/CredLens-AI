import 'dotenv/config';
import { ethers } from 'ethers';
import { chainInfo, blockProver, proofProvider } from '@gluwa/usc-sdk';
import { normalizeVerifiedData, scoreWallet } from './scoreWallet';

type VerifiedTx = {
  walletAddress: string;
  chain: 'sepolia';
  verificationStatus: 'VERIFIED';
  timestampIso: string;
  valueEth: number;
};

function buildVerifiedWalletSummary(transactions: VerifiedTx[]) {
  if (transactions.length === 0) {
    throw new Error('No verified transactions provided');
  }

  const first = transactions[0];
  if (!first) {
    throw new Error('No verified transactions provided');
  }

  if (first.verificationStatus !== 'VERIFIED') {
    throw new Error('No attested data, no score');
  }

  for (const tx of transactions) {
    if (tx.verificationStatus !== 'VERIFIED') {
      throw new Error('No attested data, no score');
    }

    if (tx.walletAddress.toLowerCase() !== first.walletAddress.toLowerCase()) {
      throw new Error('All verified transactions must belong to the same wallet');
    }

    if (tx.chain !== 'sepolia') {
      throw new Error('This MVP scorer currently supports Sepolia only');
    }
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const sorted = [...transactions].sort((a, b) => {
    return new Date(a.timestampIso).getTime() - new Date(b.timestampIso).getTime();
  });

  const earliest = sorted[0];
  if (!earliest) {
    throw new Error('No verified transactions provided');
  }

  const earliestTxTime = new Date(earliest.timestampIso).getTime();
  const walletAgeDays = Math.max(
    0,
    Math.floor((now.getTime() - earliestTxTime) / (24 * 60 * 60 * 1000))
  );

  const recentTransactions = transactions.filter((tx) => {
    return new Date(tx.timestampIso).getTime() >= thirtyDaysAgo.getTime();
  });

  const uniqueActiveDays30d = new Set(
    recentTransactions.map((tx) => tx.timestampIso.slice(0, 10))
  ).size;

  const totalTxCount = transactions.length;
  const txCount30d = recentTransactions.length;

  const totalValueEth = transactions.reduce((sum, tx) => sum + tx.valueEth, 0);
  const avgTxValueEth = totalTxCount > 0 ? totalValueEth / totalTxCount : 0;

  return {
    walletAddress: first.walletAddress,
    chain: 'sepolia' as const,
    verificationStatus: 'VERIFIED' as const,
    walletAgeDays,
    txCount30d,
    uniqueActiveDays30d,
    totalTxCount,
    avgTxValueEth
  };
}

async function main() {
  const cc3RpcUrl = process.env.CC3_RPC_URL;
  const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
  const proverUrl = process.env.PROVER_URL;
  const sepoliaTxHash = process.env.SEPOLIA_TX_HASH;

  if (!cc3RpcUrl) throw new Error('Missing CC3_RPC_URL in .env');
  if (!sepoliaRpcUrl) throw new Error('Missing SEPOLIA_RPC_URL in .env');
  if (!proverUrl) throw new Error('Missing PROVER_URL in .env');
  if (!sepoliaTxHash) throw new Error('Missing SEPOLIA_TX_HASH in .env');

  if (!ethers.isHexString(sepoliaTxHash, 32)) {
    throw new Error('SEPOLIA_TX_HASH is not a valid 32-byte transaction hash');
  }

  const chainKey = 1; // Ethereum Sepolia on CC3 Testnet

  const sourceProvider = new ethers.JsonRpcProvider(sepoliaRpcUrl);
  const creditcoinProvider = new ethers.JsonRpcProvider(cc3RpcUrl);

  const chainInfoProvider = new chainInfo.PrecompileChainInfoProvider(
    creditcoinProvider
  );
  const prover = new blockProver.PrecompileBlockProver(creditcoinProvider);
  const proofBuilder = new proofProvider.service.ProofBuilder(
    chainKey,
    proverUrl
  );

  const supportedChains = await chainInfoProvider.getSupportedChains();
  console.log('Supported chains:', supportedChains);

  const tx = await sourceProvider.getTransaction(sepoliaTxHash);
  if (!tx) {
    throw new Error('Transaction not found on Sepolia');
  }

  if (!tx.blockNumber) {
    throw new Error('Transaction is not mined yet');
  }

  const block = await sourceProvider.getBlock(tx.blockNumber);
  if (!block) {
    throw new Error('Block not found for transaction');
  }

  console.log('Found Sepolia transaction');
  console.log('Hash:', tx.hash);
  console.log('Block number:', tx.blockNumber);
  console.log('From:', tx.from);
  console.log('To:', tx.to);

  console.log('Waiting for block attestation on CC3...');
  await proofBuilder.waitUntilHeightAttested(chainKey, tx.blockNumber);

  console.log('Requesting proof from prover...');
  const result = await proofBuilder.getProof(sepoliaTxHash);

  if (!result.success || !result.data) {
    throw new Error(`Proof generation failed: ${result.error}`);
  }

  const { chainKey: ck, headerNumber, txBytes, merkleProof, continuityProof } =
    result.data;

  console.log('Proof received');
  console.log('Header number:', headerNumber);

  const verified = await prover.verifySingle(
    ck,
    headerNumber,
    txBytes,
    merkleProof,
    continuityProof
  );

  console.log('Verification result:', verified ? 'VERIFIED' : 'FAILED');

  if (!verified) {
    throw new Error('Verification failed, refusing to score unverified data');
  }

  const verifiedTransactions: VerifiedTx[] = [
    {
      walletAddress: tx.from,
      chain: 'sepolia',
      verificationStatus: 'VERIFIED',
      timestampIso: new Date(block.timestamp * 1000).toISOString(),
      valueEth: Number(ethers.formatEther(tx.value))
    }
  ];

  const summary = buildVerifiedWalletSummary(verifiedTransactions);
  const normalized = normalizeVerifiedData(summary);
  const scoreResult = scoreWallet(normalized);

  console.log('VERIFIED WALLET SUMMARY');
  console.log(summary);

  console.log('NORMALIZED INPUT');
  console.log(normalized);

  console.log('SCORE RESULT');
  console.log(scoreResult);
}

main().catch((error) => {
  console.error('Script failed:', error);
});
