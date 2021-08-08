const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

describe("HarbergerAsset", function () {
  let HarbergerAsset, contract;
  let admin, creator, owner, collector, addresses;
  let transaction, error;
  let tokenId = 1;
  let arweaveId = "kdpsb5a43J9PIUEkfxnXUTuXSH631OOdk6UWvypVAlg";
  let ipfsHash = "QmWthViHXmEHUkweUp6u5NTrFX6MsdXcQEUXZop75vUafZ";
  let priceAmount = '1000000000000000000';
  let taxAmount = '100000000000000000';
  let oneDay = 86400;
  let offset = 180; // seconds

  beforeEach(async function () {
    HarbergerAsset = await ethers.getContractFactory("HarbergerAsset");
    [admin, creator, owner, collector, ...addresses] = await ethers.getSigners();

    contract = await HarbergerAsset.deploy(admin.address);
    await contract.deployed();
  });

  describe("buyAssetInWei", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(arweaveId, ipfsHash, creator.address);
      await transaction.wait();

      transaction = await contract.connect(creator).transferFrom(creator.address, owner.address, tokenId);
      await transaction.wait();

      transaction = await contract.connect(owner).approve(contract.address, tokenId);
      await transaction.wait();

      transaction = await contract.connect(owner).listAssetForSaleInWei(tokenId, priceAmount);
      await transaction.wait();

      transaction = await contract.connect(owner).depositTaxInWei(tokenId, { value: taxAmount });
      await transaction.wait();
    });

    it("requires tokenId to exist", async function () {
      try {
        transaction = await contract.connect(owner).buyAssetInWei(2, { value: priceAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Token does not exist");
    });

    it("requires caller to NOT be owner", async function () {
      try {
        transaction = await contract.connect(owner).buyAssetInWei(tokenId, { value: priceAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are already the owner of this asset");
    });

    it("requires asset to have a sales price", async function () {
      transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: priceAmount });
      await transaction.wait();

      try {
        transaction = await contract.buyAssetInWei(tokenId, { value: priceAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("This asset is currently not up for sale");
    });

    it("requires correct payment amount", async function () {
      try {
        transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: taxAmount });
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Invalid payment amount");
    });

    it("transfers payment and royalty amount", async function () {
      let currentAdminBalance = await admin.getBalance();
      let currentCreatorBalance = await creator.getBalance();
      let currrentOwnerBalance = await owner.getBalance();

      transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: priceAmount });
      await transaction.wait();

      let updatedAdminBalance = await admin.getBalance();
      let updatedCreatorBalance = await creator.getBalance();
      let updatedOwnerBalance = await owner.getBalance();

      let adminRoyalty = (updatedAdminBalance - currentAdminBalance) / 1e18;
      let creatorRoyalty = (updatedCreatorBalance - currentCreatorBalance) / 1e18;
      let ownerPayment = (updatedOwnerBalance - currrentOwnerBalance) / 1e18;

      expect(adminRoyalty.toFixed(2)).to.equal('0.05');
      expect(creatorRoyalty.toFixed(2)).to.equal('0.05');
      expect(ownerPayment.toFixed(2)).to.equal('0.99');
    });

    it("transfers asset to new owner", async function () {
      transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: priceAmount });
      await transaction.wait();

      expect(await contract.ownerOf(tokenId)).to.equal(collector.address);
    });

    it("resets asset to default state", async function () {
      transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: priceAmount });
      await transaction.wait();

      let asset = await contract.assets(tokenId);
      let currentTime = Math.floor(Date.now() / 1000);
      let foreclosureTime = currentTime + oneDay;

      expect(asset.priceAmount.toNumber()).to.equal(0);
      expect(asset.taxAmount.toNumber()).to.equal(0);
      expect(asset.totalDepositAmount.toNumber()).to.equal(0);
      expect(asset.lastDepositTimestamp.toNumber()).to.be.within(currentTime - offset, currentTime + offset);
      expect(asset.foreclosureTimestamp.toNumber()).to.be.within(foreclosureTime - offset, foreclosureTime + offset);
    });
  });
});
