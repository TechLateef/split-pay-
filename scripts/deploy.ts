import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting SplitPay contracts deployment on Monad...");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MON");

  const SplitFactory = await ethers.getContractFactory("SplitFactory");
  const factory = await SplitFactory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("✅ SplitFactory deployed to:", factoryAddress);

  // Prepare artifact export for mobile app
  const mobileContractsDir = path.join(__dirname, "../mobile/contracts");
  if (!fs.existsSync(mobileContractsDir)) {
    fs.mkdirSync(mobileContractsDir, { recursive: true });
  }

  // Get SplitFactory Artifact
  const factoryArtifact = await ethers.getContractFactory("SplitFactory");
  const factoryInterface = factoryArtifact.interface.formatJson();

  // Get SplitBill Artifact
  const billArtifact = await ethers.getContractFactory("SplitBill");
  const billInterface = billArtifact.interface.formatJson();

  const deployedInfo = {
    network: "monadTestnet",
    chainId: 10143,
    factoryAddress: factoryAddress,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(mobileContractsDir, "SplitFactory.json"),
    JSON.stringify({ address: factoryAddress, abi: JSON.parse(factoryInterface) }, null, 2)
  );

  fs.writeFileSync(
    path.join(mobileContractsDir, "SplitBill.json"),
    JSON.stringify({ abi: JSON.parse(billInterface) }, null, 2)
  );

  fs.writeFileSync(
    path.join(mobileContractsDir, "deployed.json"),
    JSON.stringify(deployedInfo, null, 2)
  );

  console.log("📂 Exported ABIs and address to /mobile/contracts/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
