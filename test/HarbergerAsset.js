const { expect } = require("chai");

describe("HarbergerAsset contract", function () {
  let HarbergerAsset;
  let contract;
  let admin;
  let creator;
  let collector;
  let addresses;
  let tokenId = 1;

  beforeEach(async function () {
    HarbergerAsset = await ethers.getContractFactory("HarbergerAsset");
    [admin, creator, collector, ...addresses] = await ethers.getSigners();

    contract = await HarbergerAsset.deploy();
    await contract.deployed();
  });

  describe("Deployment", function () {
    it("Should set admin", async function () {
      expect(await contract.admin()).to.equal(admin.address);
    });
  });

  describe("MintAsset", function () {
    let ipfsBaseURI = process.env.IPFS_BASE_URI;
    let ipfsHash = "QmWthViHXmEHUkweUp6u5NTrFX6MsdXcQEUXZop75vUafZ";

    it("Should require msgSender to be admin", async function () {
      try {
        transaction = await contract.connect(collector).mintAsset(ipfsHash, creator.address);
      } catch(err) {
        transaction = err.message.split("'")[1];
      }

      expect(transaction).to.equal("You are not authorized to perform this action");
    });

    it("Should require tokenURI to not exist", async function () {
      let transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();

      try {
        transaction = await contract.mintAsset(ipfsHash, collector.address);
      } catch(err) {
        transaction = err.message.split("'")[1];
      }

      expect(transaction).to.equal("TokenURI already exists");
    });

    it("Should set tokenURI", async function () {
      let transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();

      expect(await contract.tokenURI(tokenId)).to.equal(ipfsBaseURI + ipfsHash);
    });

    it("Should initialize asset", async function () {
      let transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();

      let asset = await contract.assets(tokenId);
      let currentTime = Math.floor(Date.now() / 1000);
      let foreclosureTime = currentTime + 86400;
      let offset = 180;

      expect(asset.tokenId.toNumber()).to.equal(tokenId);
      expect(asset.creator).to.equal(creator.address);
      expect(asset.priceAmount.toNumber()).to.equal(0);
      expect(asset.taxAmount.toNumber()).to.equal(0);
      expect(asset.totalDepositAmount.toNumber()).to.equal(0);
      expect(asset.lastDepositTimestamp.toNumber()).to.be.within(currentTime - offset, currentTime);
      expect(asset.foreclosureTimestamp.toNumber()).to.be.within(foreclosureTime - offset, foreclosureTime);
    });

    it("Should initialize admin and creator balances", async function () {
      let transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();

      let adminBalance = await contract.balances(tokenId, admin.address);
      let creatorBalance = await contract.balances(tokenId, creator.address);

      expect(adminBalance.toNumber()).to.equal(0);
      expect(creatorBalance.toNumber()).to.equal(0);
    });

    it("Should initialize base tax value", async function () {
      let transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();

      let baseTaxValue = await contract.baseTaxValues(tokenId);

      expect(baseTaxValue).to.equal('10000000000000000');
    });
  });
});
