import { defineConfig } from "hardhat/config";
import type { HardhatUserConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = defineConfig({
  plugins: [hardhatEthers],
  solidity: "0.8.24",
  networks: {
    cc3: {
      type: "http",
      url: process.env.CC3_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
});

export default config;
