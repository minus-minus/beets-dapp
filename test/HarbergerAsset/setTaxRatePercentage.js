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

  describe("setTaxRatePercentage", function () {
    let newTaxRatePercentage = 5;

    it("requires caller to be admin", async function () {
      try {
        transaction = await contract.connect(collector).setTaxRatePercentage(newTaxRatePercentage);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not authorized to perform this action");
    });

    it("requires new value to be different than current value", async function () {
      try {
        transaction = await contract.setTaxRatePercentage(10);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("New value must be different than the current value");
    });

    it("updates tax rate percentage with new value", async function () {
      transaction = await contract.setTaxRatePercentage(newTaxRatePercentage);
      await transaction.wait();

      expect(await contract.taxRatePercentage()).to.equal(newTaxRatePercentage);
    });
  });
});
