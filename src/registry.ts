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

  const normalizedScore = Math.round(score);

  const tx = await registry.setScore(walletAddress, normalizedScore, label);
  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error('setScore transaction was sent but no receipt was returned');
  }

  return {
    registryAddress,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    scorerWallet: signer.address
  };
}
