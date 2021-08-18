const hre = require("hardhat")
const fs = require("fs");
const contractsDir = __dirname + "/../frontend/src/contracts";
const ADMIN_ADDRESS = "0xED29CfC3Bd78019e57b3b2BbFf62258a7e674eE5";
const CREATOR_ADDRESS = "0x232E02988970e8aB920c83964cC7922d9C282DCA";
const payees = [ADMIN_ADDRESS, CREATOR_ADDRESS];
const shares = [50, 50];

async function main() {
  await hre.run("compile")

  const TaxCollector = await hre.ethers.getContractFactory("TaxCollector");
  const taxCollector = await TaxCollector.deploy(payees, shares);
  await taxCollector.deployed();

  console.log("TaxCollector deployed to:", taxCollector.address);

  saveFrontendFiles(harbergerAsset);

  const HarbergerAsset = await hre.ethers.getContractFactory("HarbergerAsset");
  const harbergerAsset = await HarbergerAsset.deploy(ADMIN_ADDRESS);
  await harbergerAsset.deployed();

  console.log("HarbergerAsset deployed to:", harbergerAsset.address);

  saveFrontendFiles(taxCollector, harbergerAsset);
}

function saveFrontendFiles(taxCollector, harbergerAsset) {
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({
      TaxCollector: taxCollector.address,
      HarbergerAsset: harbergerAsset.address
    }, undefined, 2)
  );

  const TaxArtifact = artifacts.readArtifactSync("TaxCollector");

  fs.writeFileSync(
    contractsDir + "/TaxCollector.json",
    JSON.stringify(TaxArtifact, null, 2)
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
