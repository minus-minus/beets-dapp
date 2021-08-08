const hre = require("hardhat")
const fs = require("fs");
const contractsDir = __dirname + "/../frontend/src/contracts";
const CONTRACT_ADMIN = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
// const CONTRACT_ADMIN = "0x232E02988970e8aB920c83964cC7922d9C282DCA";

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
