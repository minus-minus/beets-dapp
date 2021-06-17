const hre = require("hardhat")

async function main() {
  await hre.run("compile")

  const HarbergerAsset = await hre.ethers.getContractFactory("HarbergerAsset");
  const harbergerAsset = await HarbergerAsset.deploy();
  await harbergerAsset.deployed();

  console.log("HarbergerAsset deployed to:", harbergerAsset.address);

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();

  console.log("Token deployed to:", token.address);

// We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(harbergerAsset, token);
}

function saveFrontendFiles(harbergerAsset, token) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({
      HarbergerAsset: harbergerAsset.address,
      Token: token.address
    }, undefined, 2)
  );

  const HarbergerArtifact = artifacts.readArtifactSync("HarbergerAsset");

  fs.writeFileSync(
    contractsDir + "/HarbergerAsset.json",
    JSON.stringify(HarbergerArtifact, null, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Token")

  fs.writeFileSync(
    contractsDir + "/Token.json",
    JSON.stringify(TokenArtifact, null, 2)
  );
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
