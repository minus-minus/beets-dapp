const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

describe("HarbergerAsset", function () {
  let HarbergerAsset, contract;
  let admin, creator, owner, collector, addresses;
  let transaction;
  let ipfsHash = "QmWthViHXmEHUkweUp6u5NTrFX6MsdXcQEUXZop75vUafZ";

  beforeEach(async function () {
    HarbergerAsset = await ethers.getContractFactory("HarbergerAsset");
    [admin, creator, owner, collector, ...addresses] = await ethers.getSigners();

    contract = await HarbergerAsset.deploy(admin.address);
    await contract.deployed();
  });

  describe("fetchAssets", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();

      transaction = await contract.mintAsset('asset2', owner.address);
      await transaction.wait();

      transaction = await contract.mintAsset('asset3', collector.address);
      await transaction.wait();
    });

    it("returns the total inventory of assets", async function() {
      assets = await contract.fetchAssets();

      expect(assets.length).to.equal(3);
      expect(assets[0].tokenId).to.equal(1);
      expect(assets[1].tokenId).to.equal(2);
      expect(assets[2].tokenId).to.equal(3);
      expect(assets[0].creator).to.equal(creator.address);
      expect(assets[1].creator).to.equal(owner.address);
      expect(assets[2].creator).to.equal(collector.address);
    });
  });
});
