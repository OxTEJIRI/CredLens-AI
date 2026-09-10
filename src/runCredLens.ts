import 'dotenv/config';
import { ethers } from 'ethers';
import { chainInfo, blockProver, proofProvider } from '@gluwa/usc-sdk';
import { normalizeVerifiedData, scoreWallet } from './scoreWallet.js';
import { storeScoreOnChain } from './registry.js';

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

export async function runCredLensPipeline(sepoliaTxHash: string) {
  const cc3RpcUrl = process.env.CC3_RPC_URL;
  const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
  const proverUrl = process.env.PROVER_URL;

  if (!cc3RpcUrl) throw new Error('Missing CC3_RPC_URL in .env');
  if (!sepoliaRpcUrl) throw new Error('Missing SEPOLIA_RPC_URL in .env');
  if (!proverUrl) throw new Error('Missing PROVER_URL in .env');
  if (!process.env.CREDLENS_REGISTRY_ADDRESS) {
    throw new Error('Missing CREDLENS_REGISTRY_ADDRESS in .env');
  }

  if (!ethers.isHexString(sepoliaTxHash, 32)) {
    throw new Error('txHash is not a valid 32-byte transaction hash');
  }

  const chainKey = 1; // Ethereum Sepolia on CC3 Testnet

  const sourceProvider = new ethers.JsonRpcProvider(sepoliaRpcUrl);
  const creditcoinProvider = new ethers.JsonRpcProvider(cc3RpcUrl);

  const chainInfoProvider = new chainInfo.PrecompileChainInfoProvider(
    creditcoinProvider as any
  );
  const prover = new blockProver.PrecompileBlockProver(
    creditcoinProvider as any
  );
  const proofBuilder = new proofProvider.service.ProofBuilder(
    chainKey,
    proverUrl
  );

  const supportedChains = await chainInfoProvider.getSupportedChains();

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

  await chainInfoProvider.waitUntilHeightAttested(chainKey, tx.blockNumber);

  const proofResult = await proofBuilder.getProof(sepoliaTxHash);
  if (!proofResult.success || !proofResult.data) {
    throw new Error(`Proof generation failed: ${proofResult.error}`);
  }

  const {
    chainKey: ck,
    headerNumber,
    txBytes,
    merkleProof,
    continuityProof
  } = proofResult.data;

  const verified = await prover.verifySingle(
    ck,
    headerNumber,
    txBytes,
    merkleProof,
    continuityProof
  );

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

  const rawScore = Number(scoreResult.score);
  if (!Number.isFinite(rawScore)) {
    throw new Error(`Scoring engine returned a non-finite score: ${scoreResult.score}`);
  }

  const storedScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  console.log('CredLens scoring debug:', {
    rawScore,
    storedScore,
    label: scoreResult.label
  });

  if (storedScore !== rawScore) {
    console.warn(
      `CredLens score clamped from ${rawScore} to ${storedScore} for contract storage`
    );
  }

  const onChainWrite = await storeScoreOnChain(
    summary.walletAddress,
    storedScore,
    scoreResult.label
  );

  return {
    verified: true,
    sourceChain: 'sepolia' as const,
    sourceTxHash: tx.hash,
    sourceTxBlockNumber: tx.blockNumber,
    walletAddress: summary.walletAddress,
    summary,
    normalized,
    rawScore,
    storedScore,
    score: storedScore,
    label: scoreResult.label,
    registryAddress: onChainWrite.registryAddress,
    registryTxHash: onChainWrite.txHash,
    registryBlockNumber: onChainWrite.blockNumber ?? null,
    scorerWallet: onChainWrite.scorerWallet,
    supportedChains
  };
}
