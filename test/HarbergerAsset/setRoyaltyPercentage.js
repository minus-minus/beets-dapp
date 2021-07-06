const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

describe("HarbergerAsset", function () {
  let HarbergerAsset, contract;
  let admin, creator, owner, collector, addresses;
  let transaction, error;

  beforeEach(async function () {
    HarbergerAsset = await ethers.getContractFactory("HarbergerAsset");
    [admin, creator, owner, collector, ...addresses] = await ethers.getSigners();

    contract = await HarbergerAsset.deploy();
    await contract.deployed();
  });

  describe("setRoyaltyPercentage", function () {
    let newRoyaltyPercentage = 20;

    it("requires caller to be admin", async function () {
      try {
        transaction = await contract.connect(collector).setRoyaltyPercentage(newRoyaltyPercentage);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not authorized to perform this action");
    });

    it("requires new value to be different than current value", async function () {
      try {
        transaction = await contract.setRoyaltyPercentage(10);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("New value must be different than the current value");
    });

    it("updates royalty percentage with new value", async function () {
      transaction = await contract.setRoyaltyPercentage(newRoyaltyPercentage);
      await transaction.wait();

      expect(await contract.royaltyPercentage()).to.equal(newRoyaltyPercentage);
    });
  });
});
