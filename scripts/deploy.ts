import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const Registry = await ethers.getContractFactory("CredLensScoreRegistry");
  const registry = await Registry.deploy();

  await registry.waitForDeployment();

  console.log("CredLensScoreRegistry deployed to:", await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
