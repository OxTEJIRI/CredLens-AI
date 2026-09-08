import 'dotenv/config';
import { ethers } from 'ethers';
import { chainInfo, blockProver, proofProvider } from '@gluwa/usc-sdk';

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
}

main().catch((error) => {
  console.error('Script failed:', error);
});
