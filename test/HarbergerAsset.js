const { expect } = require("chai");

describe("HarbergerAsset contract", function () {
  let HarbergerAsset;
  let contract;
  let admin;
  let creator;
  let collector;
  let addresses;
  let ipfsBaseURI = process.env.IPFS_BASE_URI;
  let ipfsHash = "QmWthViHXmEHUkweUp6u5NTrFX6MsdXcQEUXZop75vUafZ";
  let tokenId = 1;
  let transaction;
  let error;

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
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();
    });

    it("Should require msgSender to be admin", async function () {
      try {
        transaction = await contract.connect(collector).mintAsset(ipfsHash, creator.address);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not authorized to perform this action");
    });

    it("Should require tokenURI to not exist", async function () {
      try {
        transaction = await contract.mintAsset(ipfsHash, collector.address);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("TokenURI already exists");
    });

    it("Should set tokenURI", async function () {
      expect(await contract.tokenURI(tokenId)).to.equal(ipfsBaseURI + ipfsHash);
    });

    it("Should initialize asset", async function () {
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
      let adminBalance = await contract.balances(tokenId, admin.address);
      let creatorBalance = await contract.balances(tokenId, creator.address);

      expect(adminBalance.toNumber()).to.equal(0);
      expect(creatorBalance.toNumber()).to.equal(0);
    });

    it("Should initialize base tax value", async function () {
      let baseTaxValue = await contract.baseTaxValues(tokenId);

      expect(baseTaxValue).to.equal('10000000000000000');
    });
  });

  describe("listAssetInWei", function () {
    let priceAmount = '1000000000000000000';
    let taxAmount = '100000000000000000';

    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();
    });

    it("Should require tokenId to exist", async function () {
      try {
        transaction = await contract.listAssetForSaleInWei(2, priceAmount);
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Token does not exist");
    });

    it("Should require msgSender to be owner", async function () {
      try {
        transaction = await contract.listAssetForSaleInWei(tokenId, priceAmount);
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not the owner of this asset");
    });

    it("Should require price amount to be greater than 0", async function () {
      try {
        transaction = await contract.connect(creator).listAssetForSaleInWei(tokenId, 0);
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You must set a sales price greater than 0");
    });

    it("Should set asset price and tax amounts", async function () {
      transaction = await contract.connect(creator).listAssetForSaleInWei(tokenId, priceAmount);
      await transaction.wait();

      let asset = await contract.assets(tokenId);

      expect(asset.priceAmount).to.equal(priceAmount);
      expect(asset.taxAmount).to.equal(taxAmount);
    });
  });

  describe("depositTaxInWei", function () {
    let priceAmount = '1000000000000000000';
    let taxAmount = '100000000000000000';

    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();

      transaction = await contract.connect(creator).approve(contract.address, tokenId);
      await transaction.wait();

      transaction = await contract.connect(creator).listAssetForSaleInWei(tokenId, priceAmount);
      await transaction.wait();
    });

    it("Should require tokenId to exist", async function () {
      try {
        transaction = await contract.depositTaxInWei(2, { value: taxAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Token does not exist");
    });

    it("Should require msgSender to be owner", async function () {
      try {
        transaction = await contract.depositTaxInWei(tokenId, { value: taxAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not the owner of this asset");
    });

    it("Should require price amount to first be set", async function () {
      transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: priceAmount });

      try {
        transaction = await contract.connect(collector).depositTaxInWei(tokenId, { value: taxAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You must first set a sales price");
    });

    it("Should require tax amount to be greater than 0", async function () {
      try {
        transaction = await contract.connect(creator).depositTaxInWei(tokenId, { value: 0 });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You must deposit a tax amount greater than 0");
    });

    it("Should require initial deposit to not be less than current tax price", async function () {
      try {
        transaction = await contract.connect(creator).depositTaxInWei(tokenId, { value: '90000000000000000' });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Your initial deposit must not be less than the current tax price");
    });

    it("Should update current state of asset", async function () {
      let asset = await contract.assets(tokenId);
      let currentForeclosure = asset.foreclosureTimestamp.toNumber();

      transaction = await contract.connect(creator).depositTaxInWei(tokenId, { value: taxAmount });
      await transaction.wait();

      asset = await contract.assets(tokenId);
      let taxPriceInEth = 0.1;
      let baseTaxValueInEth = 0.01;
      let currentTime = Math.floor(Date.now() / 1000);
      let foreclosureTime = currentForeclosure + (86400 * (taxPriceInEth / baseTaxValueInEth));
      let lastDepositTime = currentTime;
      let offset = 180;

      expect(asset.foreclosureTimestamp.toNumber()).to.be.within(foreclosureTime - offset, foreclosureTime);
      expect(asset.lastDepositTimestamp.toNumber()).to.within(lastDepositTime - offset, lastDepositTime);
      expect(asset.totalDepositAmount.toString()).to.equal(taxAmount);
    });
  });

  describe("buyAssetInWei", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();
    });
  });

  describe("collectFunds", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();
    });
  });

  describe("reclaimAsset", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();
    });
  });

  describe("timeExpired", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();
    });
  });

  describe("fetchAssets", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();
    });
  });

  describe("setBaseTaxValueInWei", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();
    });
  });

  describe("setBaseIntervalInSeconds", function () {

  });

  describe("setRoyaltyPercentage", function () {

  });

  describe("setTaxRatePercentage", function () {

  });
});
