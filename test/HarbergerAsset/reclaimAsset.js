const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

describe("HarbergerAsset", function () {
  let HarbergerAsset, contract;
  let admin, creator, owner, collector, addresses;
  let transaction, error;
  let tokenId = 1;
  let ipfsHash = "QmWthViHXmEHUkweUp6u5NTrFX6MsdXcQEUXZop75vUafZ";
  let oneDay = 86400;

  beforeEach(async function () {
    HarbergerAsset = await ethers.getContractFactory("HarbergerAsset");
    [admin, creator, owner, collector, ...addresses] = await ethers.getSigners();

    contract = await HarbergerAsset.deploy(admin.address);
    await contract.deployed();
  });

  describe("reclaimAsset", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();

      transaction = await contract.connect(creator).transferFrom(creator.address, owner.address, tokenId);
      await transaction.wait();

      transaction = await contract.connect(owner).approve(contract.address, tokenId);
      await transaction.wait();
    });

    it("requires token to exist", async function () {
      try {
        transaction = await contract.connect(creator).reclaimAsset(2);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Token does not exist");
    });

    it("requires caller to be creator", async function () {
      try {
        transaction = await contract.connect(owner).reclaimAsset(tokenId);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not the creator of this asset");
    });

    it("requires time to be expired", async function () {
      try {
        transaction = await contract.connect(creator).reclaimAsset(tokenId);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Time has not yet expired for you to reclaim this asset");
    });

    it("transfers asset back to creator", async function () {
      await network.provider.send("evm_increaseTime", [oneDay]);

      transaction = await contract.connect(creator).reclaimAsset(tokenId);
      await transaction.wait();

      expect(await contract.ownerOf(tokenId)).to.equal(creator.address);
    });
  });
});
