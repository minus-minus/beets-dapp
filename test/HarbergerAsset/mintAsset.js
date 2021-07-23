const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

describe("HarbergerAsset", function () {
  let HarbergerAsset, contract;
  let admin, creator, owner, collector, addresses;
  let transaction, error;
  let tokenId = 1;
  let ipfsHash = "QmWthViHXmEHUkweUp6u5NTrFX6MsdXcQEUXZop75vUafZ";
  let oneDay = 86400;
  let offset = 180; // seconds

  beforeEach(async function () {
    HarbergerAsset = await ethers.getContractFactory("HarbergerAsset");
    [admin, creator, owner, collector, ...addresses] = await ethers.getSigners();

    contract = await HarbergerAsset.deploy(admin.address);
    await contract.deployed();
  });

  describe("mintAsset", function () {
    beforeEach(async function () {
      transaction = await contract.mintAsset(ipfsHash, creator.address);
      await transaction.wait();
    });

    it("requires caller to be admin", async function () {
      try {
        transaction = await contract.connect(collector).mintAsset(ipfsHash, creator.address);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("You are not authorized to perform this action");
    });

    it("requires tokenURI to not exist", async function () {
      try {
        transaction = await contract.mintAsset(ipfsHash, collector.address);
      } catch(err) {
        error = err.message.split("'")[1];
      }

      expect(error).to.equal("TokenURI already exists");
    });

    it("sets tokenURI", async function () {
      expect(await contract.tokenURI(tokenId)).to.equal(process.env.IPFS_BASE_URI + ipfsHash);
    });

    it("sets owner of token", async function () {
      expect(await contract.ownerOf(tokenId)).to.equal(creator.address);
    });

    it("initializes asset to default state", async function () {
      let asset = await contract.assets(tokenId);
      let currentTime = Math.floor(Date.now() / 1000);
      let foreclosureTime = currentTime + oneDay;

      expect(asset.tokenId.toNumber()).to.equal(tokenId);
      expect(asset.creator).to.equal(creator.address);
      expect(asset.priceAmount.toNumber()).to.equal(0);
      expect(asset.taxAmount.toNumber()).to.equal(0);
      expect(asset.totalDepositAmount.toNumber()).to.equal(0);
      expect(asset.lastDepositTimestamp.toNumber()).to.be.within(currentTime - offset, currentTime + offset);
      expect(asset.foreclosureTimestamp.toNumber()).to.be.within(foreclosureTime - offset, foreclosureTime + offset);
    });

    it("initializes admin and creator balance", async function () {
      let adminBalance = await contract.balances(tokenId, admin.address);
      let creatorBalance = await contract.balances(tokenId, creator.address);

      expect(adminBalance.toNumber()).to.equal(0);
      expect(creatorBalance.toNumber()).to.equal(0);
    });

    it("initializes base tax value", async function () {
      let baseTaxValue = await contract.baseTaxValues(tokenId);
      let taxValueInEth = baseTaxValue / 1e18;

      expect(taxValueInEth.toFixed(2)).to.equal('0.01');
    });
  });
});
