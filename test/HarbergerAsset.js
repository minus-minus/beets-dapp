const { expect } = require("chai");

describe("HarbergerAsset contract", function () {
  let HarbergerAsset;
  let contract;
  let admin;
  let creator;
  let collector;
  let addresses;
  let transaction;
  let error;

  let tokenId = 1;
  let ipfsBaseURI = process.env.IPFS_BASE_URI;
  let ipfsHash = "QmWthViHXmEHUkweUp6u5NTrFX6MsdXcQEUXZop75vUafZ";
  let priceAmount = '1000000000000000000';
  let taxAmount = '100000000000000000';
  let offset = 180;

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

    it("Should set owner of token", async function () {
      expect(await contract.ownerOf(tokenId)).to.equal(creator.address);
    });

    it("Should initialize asset", async function () {
      let asset = await contract.assets(tokenId);
      let currentTime = Math.floor(Date.now() / 1000);
      let foreclosureTime = currentTime + 86400;

      expect(asset.tokenId.toNumber()).to.equal(tokenId);
      expect(asset.creator).to.equal(creator.address);
      expect(asset.priceAmount.toNumber()).to.equal(0);
      expect(asset.taxAmount.toNumber()).to.equal(0);
      expect(asset.totalDepositAmount.toNumber()).to.equal(0);
      expect(asset.lastDepositTimestamp.toNumber()).to.be.within(currentTime - offset, currentTime + offset);
      expect(asset.foreclosureTimestamp.toNumber()).to.be.within(foreclosureTime - offset, foreclosureTime + offset);
    });

    it("Should initialize admin and creator balances", async function () {
      let adminBalance = await contract.balances(tokenId, admin.address);
      let creatorBalance = await contract.balances(tokenId, creator.address);

      expect(adminBalance.toNumber()).to.equal(0);
      expect(creatorBalance.toNumber()).to.equal(0);
    });

    it("Should initialize base tax value", async function () {
      let baseTaxValue = await contract.baseTaxValues(tokenId);
      let taxValueInEth = baseTaxValue / 1e18;

      expect(taxValueInEth.toFixed(2)).to.equal('0.01');
    });
  });

  describe("listAssetInWei", function () {
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

      expect(asset.totalDepositAmount).to.equal(taxAmount);
      expect(asset.lastDepositTimestamp.toNumber()).to.within(currentTime - offset, currentTime + offset);
      expect(asset.foreclosureTimestamp.toNumber()).to.be.within(foreclosureTime - offset, foreclosureTime + offset);
    });
  });

  describe("buyAssetInWei", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();

      // creator is also the owner of the asset
      transaction = await contract.connect(creator).approve(contract.address, tokenId);
      await transaction.wait();

      transaction = await contract.connect(creator).listAssetForSaleInWei(tokenId, priceAmount);
      await transaction.wait();

      transaction = await contract.connect(creator).depositTaxInWei(tokenId, { value: taxAmount });
      await transaction.wait();
    });

    it("Should require tokenId to exist", async function () {
      try {
        transaction = await contract.connect(collector).buyAssetInWei(2, { value: priceAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Token does not exist");
    });

    it("Should require msgSender to NOT be owner", async function () {
      try {
        transaction = await contract.connect(creator).buyAssetInWei(tokenId, { value: priceAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are already the owner of this asset");
    });

    it("Should require asset to have a sales price", async function () {
      transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: priceAmount });
      await transaction.wait();

      try {
        transaction = await contract.buyAssetInWei(tokenId, { value: priceAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("This asset is currently not up for sale");
    });

    it("Should require correct payment amount", async function () {
      try {
        transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: taxAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Incorrect payment amount");
    });

    it("Should transfer payment and royalty amounts", async function () {
      let currentAdminBalance = await admin.getBalance();
      let currentCreatorBalance = await creator.getBalance();
      let currrentCollectorBalance = await collector.getBalance();

      transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: priceAmount });
      await transaction.wait();

      let updatedAdminBalance = await admin.getBalance();
      let updatedCreatorBalance = await creator.getBalance();
      let updatedCollectorBalance = await collector.getBalance();

      let adminRoyalty = (updatedAdminBalance - currentAdminBalance) / 1e18;
      // creator receives payment and royalty
      let creatorRoyalty = (updatedCreatorBalance - currentCreatorBalance) / 1e18;
      let collectorPayment = (currrentCollectorBalance - updatedCollectorBalance) / 1e18;

      expect(adminRoyalty.toFixed(2)).to.equal('0.05');
      expect(creatorRoyalty.toFixed(2)).to.equal('1.05');
      expect(collectorPayment.toFixed(2)).to.equal('1.00');
    });

    it("Should transfer asset to new owner", async function () {
      transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: priceAmount });
      await transaction.wait();

      expect(await contract.ownerOf(tokenId)).to.equal(collector.address);
    });

    it("Should initialize asset to default state", async function () {
      transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: priceAmount });
      await transaction.wait();

      let asset = await contract.assets(tokenId);
      let currentTime = Math.floor(Date.now() / 1000);
      let foreclosureTime = currentTime + 86400;

      expect(asset.priceAmount.toNumber()).to.equal(0);
      expect(asset.taxAmount.toNumber()).to.equal(0);
      expect(asset.totalDepositAmount.toNumber()).to.equal(0);
      expect(asset.lastDepositTimestamp.toNumber()).to.be.within(currentTime - offset, currentTime + offset);
      expect(asset.foreclosureTimestamp.toNumber()).to.be.within(foreclosureTime - offset, foreclosureTime + offset);
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
    let newBaseTaxValue = '50000000000000000';

    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();
    });

    it("Should require token to exist", async function () {
      try {
        transaction = await contract.setBaseTaxValueInWei(2, newBaseTaxValue);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Token does not exist");
    });

    it("Should require msgSender to be creator", async function () {
      try {
        transaction = await contract.setBaseTaxValueInWei(tokenId, newBaseTaxValue);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not the creator of this asset");
    });

    it("Should require new value to be different than current value", async function () {
      try {
        transaction = await contract.connect(creator).setBaseTaxValueInWei(tokenId, '10000000000000000');
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("New value must be different than the current value");
    });

    it("Should update mapping with new base tax value", async function () {

      transaction = await contract.connect(creator).setBaseTaxValueInWei(tokenId, newBaseTaxValue);
      await transaction.wait();

      expect(await contract.baseTaxValues(tokenId)).to.equal(newBaseTaxValue);
    });
  });

  describe("setBaseIntervalInSeconds", function () {
    let newBaseInterval = 43200;

    it("Should require msgSender to be admin", async function () {
      try {
        transaction = await contract.connect(collector).setBaseIntervalInSeconds(newBaseInterval);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not authorized to perform this action");
    });

    it("Should require new value to be different than current value", async function () {
      try {
        transaction = await contract.setBaseIntervalInSeconds(86400);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("New value must be different than the current value");
    });

    it("Should update base interval with new value", async function () {
      transaction = await contract.setBaseIntervalInSeconds(newBaseInterval);
      await transaction.wait();

      expect(await contract.baseInterval()).to.equal(newBaseInterval);
    });
  });

  describe("setRoyaltyPercentage", function () {
    let newRoyaltyPercentage = 20;

    it("Should require msgSender to be admin", async function () {
      try {
        transaction = await contract.connect(collector).setRoyaltyPercentage(newRoyaltyPercentage);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not authorized to perform this action");
    });

    it("Should require new value to be different than current value", async function () {
      try {
        transaction = await contract.setRoyaltyPercentage(10);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("New value must be different than the current value");
    });

    it("Should update royalty percentage with new value", async function () {
      transaction = await contract.setRoyaltyPercentage(newRoyaltyPercentage);
      await transaction.wait();

      expect(await contract.royaltyPercentage()).to.equal(newRoyaltyPercentage);
    });
  });

  describe("setTaxRatePercentage", function () {
    let newTaxRatePercentage = 5;

    it("Should require msgSender to be admin", async function () {
      try {
        transaction = await contract.connect(collector).setTaxRatePercentage(newTaxRatePercentage);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not authorized to perform this action");
    });

    it("Should require new value to be different than current value", async function () {
      try {
        transaction = await contract.setTaxRatePercentage(10);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("New value must be different than the current value");
    });

    it("Should update tax rate percentage with new value", async function () {
      transaction = await contract.setTaxRatePercentage(newTaxRatePercentage);
      await transaction.wait();

      expect(await contract.taxRatePercentage()).to.equal(newTaxRatePercentage);
    });
  });
});
