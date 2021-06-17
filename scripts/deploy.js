const hre = require("hardhat")

async function main() {
  await hre.run('compile');

  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const HarbergerAsset = await ethers.getContractFactory("HarbergerAsset");
  const harbergerAsset = await HarbergerAsset.deploy();
  await harbergerAsset.deployed();

  console.log("HarbergerAsset address:", harbergerAsset.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
