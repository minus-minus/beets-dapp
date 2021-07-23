const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

describe("HarbergerAsset", function () {
  let HarbergerAsset, contract;
  let admin, creator, owner, collector, addresses;
  let transaction, error;
  let tokenId = 1;
  let ipfsHash = "QmWthViHXmEHUkweUp6u5NTrFX6MsdXcQEUXZop75vUafZ";

  beforeEach(async function () {
    HarbergerAsset = await ethers.getContractFactory("HarbergerAsset");
    [admin, creator, owner, collector, ...addresses] = await ethers.getSigners();

    contract = await HarbergerAsset.deploy(admin.address);
    await contract.deployed();
  });

  describe("setBaseTaxValueInWei", function () {
    let newBaseTaxValue = '50000000000000000';

    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();
    });

    it("requires token to exist", async function () {
      try {
        transaction = await contract.setBaseTaxValueInWei(2, newBaseTaxValue);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Token does not exist");
    });

    it("requires caller to be creator", async function () {
      try {
        transaction = await contract.setBaseTaxValueInWei(tokenId, newBaseTaxValue);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not the creator of this asset");
    });

    it("requires new value to be different than current value", async function () {
      try {
        transaction = await contract.connect(creator).setBaseTaxValueInWei(tokenId, '10000000000000000');
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("New value must be different than the current value");
    });

    it("updates mapping with new base tax value", async function () {

      transaction = await contract.connect(creator).setBaseTaxValueInWei(tokenId, newBaseTaxValue);
      await transaction.wait();

      expect(await contract.baseTaxValues(tokenId)).to.equal(newBaseTaxValue);
    });
  });
});
