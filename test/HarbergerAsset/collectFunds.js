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

    contract = await HarbergerAsset.deploy(admin.address);
    await contract.deployed();
  });

  describe("collectFunds", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
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

    it("requires token to exist", async function () {
      try {
        transaction = await contract.connect(creator).collectFunds(2);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Token does not exist");
    });

    it("requires caller to be admin or creator", async function () {
      try {
        transaction = await contract.connect(owner).collectFunds(tokenId);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not the admin nor creator of this asset");
    });

    it("requires caller to have a balance greater than 0", async function () {
      try {
        transaction = await contract.collectFunds(tokenId);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You do not have any funds available to withdraw");
    });

    // it("transfers and resets balance of caller", async function () {
    //   await network.provider.send("evm_increaseTime", [864000]);
    //
    //   transaction = await contract.connect(collector).buyAssetInWei(tokenId, { value: priceAmount });
    //   await transaction.wait();
    //
    //   let currentAdminBalance = await admin.getBalance();
    //
    //   transaction = await contract.collectFunds(tokenId);
    //   await transaction.wait();
    //
    //   let updatedAdminBalance = await admin.getBalance();
    //   let adminFunds = (updatedAdminBalance - currentAdminBalance) / 1e18;
    //
    //   let adminBalance = await contract.balances(tokenId, admin.address);
    //   let creatorBalance = await contract.balances(tokenId, creator.address);
    //   let creatorBalanceInEth = creatorBalance / 1e18;
    //
    //   expect(adminFunds.toFixed(2)).to.equal('0.05');
    //   expect(adminBalance.toString()).to.equal('0');
    //   expect(creatorBalanceInEth.toFixed(2)).to.equal('0.05');
    // });
  });
});
