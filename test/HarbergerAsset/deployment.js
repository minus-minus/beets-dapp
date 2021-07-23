const { expect } = require("chai");

describe("HarbergerAsset", function () {
  let HarbergerAsset, contract;
  let admin, creator, owner, collector, addresses;

  beforeEach(async function () {
    HarbergerAsset = await ethers.getContractFactory("HarbergerAsset");
    [admin, creator, owner, collector, ...addresses] = await ethers.getSigners();

    contract = await HarbergerAsset.deploy(admin.address);
    await contract.deployed();
  });

  describe("deployment", function () {
    it("Should set admin", async function () {
      expect(await contract.admin()).to.equal(admin.address);
    });
  });
});
