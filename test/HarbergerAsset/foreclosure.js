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

    contract = await HarbergerAsset.deploy();
    await contract.deployed();
  });

  describe("foreclosure", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();
    });

    it("requires token to exist", async function () {
      try {
        transaction = await contract.foreclosure(2);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Token does not exist");
    });

    it("returns false if time has not yet expired", async function() {
      expect(await contract.foreclosure(tokenId)).to.equal(false);
    });

    // it("returns true if current time is greater than foreclosure time", async function() {
    //   await network.provider.send("evm_increaseTime", [oneDay]);
    //
    //   expect(await contract.foreclosure(tokenId)).to.equal(true);
    // });
  });
});
