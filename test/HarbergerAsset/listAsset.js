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

  beforeEach(async function () {
    HarbergerAsset = await ethers.getContractFactory("HarbergerAsset");
    [admin, creator, owner, collector, ...addresses] = await ethers.getSigners();

    contract = await HarbergerAsset.deploy(admin.address);
    await contract.deployed();
  });

  describe("listAssetInWei", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(arweaveId, ipfsHash, creator.address);
      await transaction.wait();

      transaction = await contract.connect(creator).transferFrom(creator.address, owner.address, tokenId);
      await transaction.wait();
    });

    it("requires tokenId to exist", async function () {
      try {
        transaction = await contract.listAssetForSaleInWei(2, priceAmount);
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("Token does not exist");
    });

    it("requires caller to be owner", async function () {
      try {
        transaction = await contract.listAssetForSaleInWei(tokenId, priceAmount);
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not the owner of this asset");
    });

    it("requires price amount to be greater than 0", async function () {
      try {
        transaction = await contract.connect(owner).listAssetForSaleInWei(tokenId, 0);
      } catch (err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You must set a sales price greater than 0");
    });

    // it("requires asset to not be up for foreclosure", async function () {
    //   await network.provider.send("evm_increaseTime", [oneDay]);
    //
    //   try {
    //     transaction = await contract.connect(owner).listAssetForSaleInWei(tokenId, priceAmount);
    //   } catch (err) {
    //     error = err.message.split("'")[1];
    //   }
    //
    //   expect(error).to.equal("A foreclosure on this asset has already begun");
    // });

    it("sets asset price and tax amount", async function () {
      transaction = await contract.connect(owner).listAssetForSaleInWei(tokenId, priceAmount);
      await transaction.wait();

      let asset = await contract.assets(tokenId);

      expect(asset.priceAmount).to.equal(priceAmount);
      expect(asset.taxAmount).to.equal(taxAmount);
    });
  });
});
