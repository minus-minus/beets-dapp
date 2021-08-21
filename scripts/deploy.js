const hre = require("hardhat")
const fs = require("fs");
const contractsDir = __dirname + "/../frontend/src/contracts";
const ADMIN_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const CREATOR_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const payees = [ADMIN_ADDRESS, CREATOR_ADDRESS];
const shares = [50, 50];

async function main() {
  await hre.run("compile")

  const PaymentSplitter = await hre.ethers.getContractFactory("PaymentSplitter");
  const paymentSplitter = await PaymentSplitter.deploy(payees, shares);
  await paymentSplitter.deployed();

  console.log("PaymentSplitter deployed to:", paymentSplitter.address);

  const HarbergerAsset = await hre.ethers.getContractFactory("HarbergerAsset");
  const harbergerAsset = await HarbergerAsset.deploy(ADMIN_ADDRESS);
  await harbergerAsset.deployed();

  console.log("HarbergerAsset deployed to:", harbergerAsset.address);

  saveFrontendFiles(paymentSplitter, harbergerAsset);
}

function saveFrontendFiles(payment, harberger) {
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({
      PaymentSplitter: payment.address,
      HarbergerAsset: harberger.address
    }, undefined, 2)
  );

  const PaymentArtifact = artifacts.readArtifactSync("PaymentSplitter");

  fs.writeFileSync(
    contractsDir + "/PaymentSplitter.json",
    JSON.stringify(PaymentArtifact, null, 2)
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
