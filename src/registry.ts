import 'dotenv/config';
import { ethers } from 'ethers';

const REGISTRY_ABI = [
  'function setScore(address wallet, uint256 score, string calldata label) external'
] as const;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in .env`);
  }
  return value;
}

export async function storeScoreOnChain(
  walletAddress: string,
  score: number,
  label: string
) {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error(`Invalid wallet address: ${walletAddress}`);
  }

  if (!Number.isFinite(score)) {
    throw new Error(`Score must be a finite number, got: ${score}`);
  }

  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const normalizedLabel = label.trim();

  if (!normalizedLabel) {
    throw new Error('Label is required');
  }

  const cc3RpcUrl = getRequiredEnv('CC3_RPC_URL');
  const privateKey = getRequiredEnv('PRIVATE_KEY');
  const registryAddress = getRequiredEnv('CREDLENS_REGISTRY_ADDRESS');

  if (!ethers.isAddress(registryAddress)) {
    throw new Error(
      `CREDLENS_REGISTRY_ADDRESS is not a valid address: ${registryAddress}`
    );
  }

  const provider = new ethers.JsonRpcProvider(cc3RpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const registry = new ethers.Contract(registryAddress, REGISTRY_ABI, signer);

  console.log('--- CredLens registry write ---');
  console.log('Registry address:', registryAddress);
  console.log('Signer address:', signer.address);
  console.log('Target wallet:', walletAddress);
  console.log('Score:', normalizedScore);
  console.log('Label:', normalizedLabel);
  console.log('Sending setScore transaction...');

  try {
    const tx = await registry.setScore(walletAddress, normalizedScore, normalizedLabel, {
      gasLimit: 500000n
    });

    console.log('Submitted tx hash:', tx.hash);

    return {
      registryAddress,
      txHash: tx.hash,
      blockNumber: null,
      scorerWallet: signer.address,
      confirmed: false
    };
  } catch (error) {
    console.error('setScore failed:', error);
    throw new Error(
      `Error calling contract method: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
