const hre = require("hardhat")
const fs = require("fs");
const contractsDir = __dirname + "/../frontend/src/contracts";
const CONTRACT_ADMIN = "0xED29CfC3Bd78019e57b3b2BbFf62258a7e674eE5";

async function main() {
  await hre.run("compile")

  const HarbergerAsset = await hre.ethers.getContractFactory("HarbergerAsset");
  const harbergerAsset = await HarbergerAsset.deploy(CONTRACT_ADMIN);
  await harbergerAsset.deployed();

  console.log("HarbergerAsset deployed to:", harbergerAsset.address);

  saveFrontendFiles(harbergerAsset);
}

function saveFrontendFiles(harbergerAsset) {
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ HarbergerAsset: harbergerAsset.address }, undefined, 2)
  );

  const HarbergerArtifact = artifacts.readArtifactSync("HarbergerAsset");

  fs.writeFileSync(
    contractsDir + "/HarbergerAsset.json",
    JSON.stringify(HarbergerArtifact, null, 2)
  );
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
