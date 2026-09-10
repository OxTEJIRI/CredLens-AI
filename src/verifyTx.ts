import 'dotenv/config';
import { runCredLensPipeline } from './runCredLens.js';

async function main() {
  const sepoliaTxHash = process.env.SEPOLIA_TX_HASH;

  if (!sepoliaTxHash) {
    throw new Error('Missing SEPOLIA_TX_HASH in .env');
  }

  const result = await runCredLensPipeline(sepoliaTxHash);

  console.log('FINAL RESULT');
  console.log(result);
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
