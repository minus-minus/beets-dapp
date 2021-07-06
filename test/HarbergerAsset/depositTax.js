const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

describe("HarbergerAsset", function () {
  let HarbergerAsset, contract;
  let admin, creator, owner, collector, addresses;
  let transaction, error;
  let tokenId = 1;
  let ipfsHash = "QmWthViHXmEHUkweUp6u5NTrFX6MsdXcQEUXZop75vUafZ";
  let priceAmount = '1000000000000000000';
  let taxAmount = '100000000000000000';
  let oneDay = 86400;
  let offset = 180; // seconds

  beforeEach(async function () {
    HarbergerAsset = await ethers.getContractFactory("HarbergerAsset");
    [admin, creator, owner, collector, ...addresses] = await ethers.getSigners();

    contract = await HarbergerAsset.deploy();
    await contract.deployed();
  });

  describe("depositTaxInWei", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();

      transaction = await contract.connect(creator).transferFrom(creator.address, owner.address, tokenId);
      await transaction.wait();

      transaction = await contract.connect(owner).approve(contract.address, tokenId);
      await transaction.wait();

      transaction = await contract.connect(owner).listAssetForSaleInWei(tokenId, priceAmount);
      await transaction.wait();
    });

    it("requires tokenId to exist", async function () {
      try {
        transaction = await contract.depositTaxInWei(2, { value: taxAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Token does not exist");
    });

    it("requires caller to be owner", async function () {
      try {
        transaction = await contract.depositTaxInWei(tokenId, { value: taxAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not the owner of this asset");
    });

    it("requires price amount to first be set", async function () {
      transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: priceAmount });

      try {
        transaction = await contract.connect(collector).depositTaxInWei(tokenId, { value: taxAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You must first set a sales price");
    });

    it("requires tax amount to be greater than 0", async function () {
      try {
        transaction = await contract.connect(owner).depositTaxInWei(tokenId, { value: 0 });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You must deposit a tax amount greater than 0");
    });

    it("requires initial deposit to not be less than current tax price", async function () {
      try {
        transaction = await contract.connect(owner).depositTaxInWei(tokenId, { value: '90000000000000000' });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Your initial deposit must not be less than the current tax price");
    });

    // it("requires asset to not be up for foreclosure", async function () {
    //   await network.provider.send("evm_increaseTime", [oneDay]);
    //
    //   try {
    //     transaction = await contract.connect(owner).depositTaxInWei(tokenId, { value: taxAmount });
    //   } catch (err) {
    //     error = err.message.split("'")[1];
    //   }
    //
    //   expect(error).to.equal("A foreclosure on this asset has already begun");
    // });

    it("updates current state of asset", async function () {
      let asset = await contract.assets(tokenId);
      let currentForeclosure = asset.foreclosureTimestamp.toNumber();

      transaction = await contract.connect(owner).depositTaxInWei(tokenId, { value: taxAmount });
      await transaction.wait();

      asset = await contract.assets(tokenId);
      let taxPriceInEth = 0.1;
      let baseTaxValueInEth = 0.01;
      let currentTime = Math.floor(Date.now() / 1000);
      let foreclosureTime = currentForeclosure + (oneDay * (taxPriceInEth / baseTaxValueInEth));

      expect(asset.totalDepositAmount).to.equal(taxAmount);
      expect(asset.lastDepositTimestamp.toNumber()).to.within(currentTime - offset, currentTime + offset);
      expect(asset.foreclosureTimestamp.toNumber()).to.be.within(foreclosureTime - offset, foreclosureTime + offset);
    });
  });
});
