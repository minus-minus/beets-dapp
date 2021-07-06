const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

describe("HarbergerAsset", function () {
  let HarbergerAsset, contract;
  let admin, creator, owner, collector, addresses;
  let transaction, error;
  let oneDay = 86400;

  beforeEach(async function () {
    HarbergerAsset = await ethers.getContractFactory("HarbergerAsset");
    [admin, creator, owner, collector, ...addresses] = await ethers.getSigners();

    contract = await HarbergerAsset.deploy();
    await contract.deployed();
  });

  describe("setBaseIntervalInSeconds", function () {
    let newBaseInterval = 43200;

    it("requires caller to be admin", async function () {
      try {
        transaction = await contract.connect(collector).setBaseIntervalInSeconds(newBaseInterval);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not authorized to perform this action");
    });

    it("requires new value to be different than current value", async function () {
      try {
        transaction = await contract.setBaseIntervalInSeconds(oneDay);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("New value must be different than the current value");
    });

    it("updates base interval with new value", async function () {
      transaction = await contract.setBaseIntervalInSeconds(newBaseInterval);
      await transaction.wait();

      expect(await contract.baseInterval()).to.equal(newBaseInterval);
    });
  });
});
