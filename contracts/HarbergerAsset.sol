//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract HarbergerAsset is ERC721URIStorage {
  using SafeMath for uint256;
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // Struct mapping for keeping track of the NFT (assets[tokendId] = Asset object)
  mapping(uint256 => Asset) public assets;
  // Nested mapping for keeping track of the admin and artist/creator balances (balances[tokenId][userAddress] = amount)
  // The amount just represents an integer value, it will not actually be storing any ETH)
  mapping(uint256 => mapping(address => uint256)) public balances;
  // Mapping for keeping track of tokenURIs to make sure no duplicates are ever created (hashes[tokenURI] = 1)
  mapping(string => uint256) public hashes;

  // IPFS URI used for appending the tokenURI to
  string public baseURI = "https://ipfs.io/ipfs/";

  // user that deploys the contract (BeetsDAO)
  address public admin;
  // the base amount of time in seconds for calculating taxes (.01 eth for every 12 hours)
  uint256 public baseInterval = 43200 seconds;
  // the base tax price in wei for calculating taxes (.01 eth for every 12 hours)
  uint256 public baseTaxPrice = 1e16;
  // the percentage amount to show how royalties for the creator are calculated
  uint256 public royaltyPercentage = 10;
  // the percentage amount used to show how total taxes due are calculated
  uint256 public taxPercentage = 10;
  // denominator (equivalent to royaltyPercentage) used for actually calculating total royalties due (price / royaltyDenominator)
  uint256 private royaltyDenominator = 100 / royaltyPercentage;
  // denominator (equivalent to taxPercentage) used for actually calculating total taxes due (salesPrice / taxDenominator)
  uint256 private taxDenominator = 100 / taxPercentage;

  // Object that holds current state of the NFT (creator will never change)
  struct Asset {
    uint256 tokenId;  // token ID of the NFT
    address creator;  // artist that creates the NFT
    uint256 price; // current sales price (in wei) of NFT
    uint256 taxAmount; // calculated tax price (in wei) that is due by deadline
    uint256 totalDeposit; // total amount (in wei) the current owner has deposited in taxes
    uint256 deadline; // the timestamp for when taxes are due (this is continuously rolling or reset to the base time interval)
    uint256 lastDeposit; // the latest timestamp of when the current owner paid their taxes
  }

  // Contract events help us keep track of when a transaction occurs in order to log ownership history/provenance of each NFT
  event List   (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value);
  event Deposit(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to, uint256 value);
  event Sale   (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value);
  event Refund (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to, uint256 value);
  event Collect(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value);
  event Reclaim(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to);

  // Admin user will be assigned to whomever deploys the contract (BeetsDAO)
  constructor() ERC721("HarbergerAsset", "ASSET") {
    admin = _msgSender();
  }

  // Overriding inherited (ERC721URIStorage) function to set the baseURI to the IPFS link (otherwise this function returns an empty string)
  function _baseURI() override internal view virtual returns (string memory) {
    return baseURI;
  }

  // Only the admin can call this function
  function mintToken(address _creator, string memory _tokenURI) public returns (uint256) {
    // First check if the user calling the function is the admin
    require(admin == _msgSender(), "This function is restricted to only admin users");
    // Then check if tokenURI already exists to prevent duplicates from being created
    require(hashes[_tokenURI] < 1, "TokenURI already exists");
    // Increase the value of the tokenURI key by 1 (this value should never be greater than 1)
    hashes[_tokenURI] += 1;
    // Increment the _tokenIds var derived from the Counters library
    _tokenIds.increment();

    // Create a new var and set it equal to the current value of _tokenIds
    uint256 newItemId = _tokenIds.current();
    // Mints the NFT and sets the initial owner as the creator of the asset
    _safeMint(_creator, newItemId);
    // Call inherited (ERC721URIStorage) function to store the tokenURI based on the tokenId
    _setTokenURI(newItemId, _tokenURI);

    // Initialize the Asset struct for the NFT
    // Set creator equal to the _creator param
    // Set all price values equal to 0
    // set new deadline equal to the current time plus the base time interval of 12 hours (43200 secs)
    // set Deposit equal to the current time
    assets[newItemId] = Asset(newItemId, _creator, 0, 0, 0, block.timestamp.add(baseInterval), block.timestamp);
    // Initialize balances for the admin and creator once the Asset is created
    balances[newItemId][admin] = 0;
    balances[newItemId][_creator] = 0;

    // return the tokenId of the NFT that was just created
    return newItemId;
  }

  // Only the current owner of the Asset can call this function
  function listAssetForSaleInWei(uint256 _tokenId, uint256 _price) public {
    // First check if the tokenId exists
    require(_exists(_tokenId), "Token does not exist");
    // Then check if the user calling this function is the current owner of the Asset
    require(ownerOf(_tokenId) == _msgSender(), "You are not the owner of this asset");
    // Finally check if the price is greater than 0
    require(_price > 0, "You must set a sales price greater than 0");

    // Store the price of the asset
    assets[_tokenId].price = _price;
    // Calculate and store the tax price (salesPrice * taxPercentage is equivalent to salesPrice / taxDenominator)
    assets[_tokenId].taxAmount = _price.div(taxDenominator);

    // Log the list transacation event to the contract
    emit List(block.timestamp, _tokenId, _msgSender(), _price);
  }

  // Only the current owner of the Asset can call this function
  function depositTaxInWei(uint256 _tokenId) public payable {
    // First check if the NFT exists
    require(_exists(_tokenId), "Token does not exist");
    // Next check if the user calling the function is the owner of the Asset
    require(ownerOf(_tokenId) == _msgSender(), "You are not the owner of this asset");
    // Then check if the Asset has a sales price greater than 0 before the current owner can depoist any taxes
    require(assets[_tokenId].price > 0, "You must first set a sales price");
    // Finally check if the amount deposited by the current owner is greater than or equal to the current tax price of the Asset
    require(msg.value >= assets[_tokenId].taxAmount, "Insufficient tax funds deposited");

    // Calculate the tax multiplier by dividing the base tax price in wei (.01 eth) by the total amount deposited
    uint256 taxMultiplier = msg.value.div(baseTaxPrice);
    // Calculate the new deadline by multiplying the base time interval (43200 secs) by the tax multiplier
    assets[_tokenId].deadline += baseInterval.mul(taxMultiplier);
    // Set the last Deposit equal to the current timestamp of the transaction
    assets[_tokenId].lastDeposit = block.timestamp;
    // Add the deposit value to the current owner's total deposit for the Asset
    assets[_tokenId].totalDeposit += msg.value;

    // Log the deposit event to the contract
    emit Deposit(block.timestamp, _tokenId, _msgSender(), address(this), msg.value);
  }

  // Any user (besides the current owner) can call this function
  function buyAssetInWei(uint256 _tokenId) public payable {
    // First check if the NFT exists
    require(_exists(_tokenId), "Token does not exist");
    // Then check if the user calling this function is NOT the owner of the Asset
    require(ownerOf(_tokenId) != _msgSender(), "You are already the owner of this asset");
    // Next check if the asset has a sales price greater than 0
    require(assets[_tokenId].price > 0, "This item is not yet for sale");
    // Finally verify that the amount being paid by the user is equivalent to the actual sales price of the Asset
    require(assets[_tokenId].price == msg.value, "Incorrect amount paid");

    // When a user sends ETH to a contract through msg.value,
    // that value is automatically added to the contract's current balance (contractBalance += msg.value)

    // Get the current owner of the Asset
    address currentOwner = ownerOf(_tokenId);
    // Ge the creator of the Asset
    address creator = assets[_tokenId].creator;
    // calculate the royalty amount (value * royaltyPercentage is equivalent to value / royaltyDenominator)
    uint256 royalty = msg.value.div(royaltyDenominator);
    // Subtract the royalty amount from the total price to get remaining payment for the current owner
    uint256 payment = msg.value.sub(royalty);

    // Contract first transfers the royalty amount to the creator of the Asset
    payable(creator).transfer(royalty);
    // Contract then transfers the remaining payment amount to the current owner of the Asset
    payable(currentOwner).transfer(payment);
    // Log the sale transaction event to the contract
    emit Sale(block.timestamp, _tokenId, _msgSender(), msg.value);

    // Next we want to refund the excess amount of taxes paid by the current owner (see function below)
    refundTax(_tokenId, currentOwner);

    // After payments are sent out, the contract transfers the NFT from the current owner to the new owner (user that called the function)
    // This inherited (IERC721) function will then emit a Transfer event, which is why we first log the Sale event
    // The key word 'this' is used to specify that the contract (which has been approved) is calling the transfer function
    // Otherwise, it will fail since the user calling this function does not have approval to transfer it to themself
    this.safeTransferFrom(currentOwner, _msgSender(), _tokenId);

    // Get current balance of the contract
    uint256 contractBalance = address(this).balance;
    // Get current balance of admin for specified Asset (this is just an integer value, does not represent actual ETH)
    uint256 adminBalance = balances[_tokenId][admin];
    // Get current balance of creator for specified Asset (this is just an integer value, does not represent actual ETH)
    uint256 creatorBalance = balances[_tokenId][creator];
    // Subtract admin and creator balance from the contract's current balance
    uint256 remainingBalance = contractBalance.sub(adminBalance).sub(creatorBalance);

    // Only once a sale is made and taxes are refunded can we add to the admin and creator's balances
    // We then add half of the remaining balance to each of the admin and creator's current balances
    balances[_tokenId][admin] += remainingBalance.div(2).sub(adminBalance);
    balances[_tokenId][creator] += remainingBalance.div(2).sub(creatorBalance);

    // Reset the Asset values whenever is sale is made (see function below)
    resetAsset(_tokenId);
    // Increase the base tax price by .001 ETH whenever a sale is made (temporary change/experimental)
    baseTaxPrice += 1e15;
    // Increase the base time interval by 72 minutes whenever a sale is made (temporary/experimental)
    /* baseInterval += 4320 seconds; */
  }

  // Internal function called once a sale is made (called from buyAssetInWei)
  function refundTax(uint256 _tokenId, address _currentOwner) internal {
    // Get deadline of the Asset
    uint256 deadline = assets[_tokenId].deadline;
    // Calculate the time remaining for the Asset
    uint256 timeRemaining = deadline - block.timestamp;

    // Time remaining can possibly be negative so we wrap both vars with int256 before executing the conditional
    // Check if timeRemaining is greater than the base time interval which is 12 hours (43200 secs)
    // The reason is because 12 hours is the default time added to the deadline whenever an Asset is reset due to a sale or reclaim
    if (int256(timeRemaining) > int256(baseInterval)) {
      // Calculate taxMultiplier by dividing timeRemaining from the base time interval (43000 secs)
      uint256 taxMultiplier = timeRemaining.div(baseInterval);
      // Calculate amount that needs to be refunded by mulitplying base tax price by tax multiplier
      uint256 refundAmount = baseTaxPrice.mul(taxMultiplier);

      // Refund the current owner of the Asset
      payable(_currentOwner).transfer(refundAmount);
      // Log the refund event to the contract
      emit Refund(block.timestamp, _tokenId, address(this), _currentOwner, refundAmount);
    }
  }

  // Only the admin and creator can call this function
  function collectFunds(uint256 _tokenId) public {
    // First check if the NFT exists
    require(_exists(_tokenId), "Token does not exist");
    // Then check if the user calling the function has any funds available to withdraw
    require(balances[_tokenId][_msgSender()] > 0, "You do not have any funds available to withdraw");

    // Get the user's current balance for the Asset
    uint256 amount = balances[_tokenId][_msgSender()];
    // Send the user their current balance
    payable(_msgSender()).transfer(amount);
    // Reset the user balance
    balances[_tokenId][_msgSender()] = 0;

    // Log the collect event to the contract
    emit Collect(block.timestamp, _tokenId, _msgSender(), amount);
  }

  // Only the creator of the Asset can call this function
  function reclaimAsset(uint256 _tokenId) public {
    // First check if the NFT exists
    require(_exists(_tokenId), "Token does not exist");
    // Next check if the user calling the function is the owner of the Asset
    require(_msgSender() == assets[_tokenId].creator, "You are not the creator of this asset");
    // Finally check if time has expired for the Asset
    require(timeExpired(_tokenId), "Time has not yet expired for you to reclaim this asset");

    // Get the current owner of Asset
    address currentOwner = ownerOf(_tokenId);
    // Log the reclaim event to the contract (we do this before transfering the asset)
    emit Reclaim(block.timestamp, _tokenId, _msgSender(), currentOwner);

    // Transfer the asset from the current owner back to the creator (this will also log the Transfer event to the contract)
    safeTransferFrom(currentOwner, _msgSender(), _tokenId);
    // Reset the Asset values since the asset now has a new owner (see function below)
    resetAsset(_tokenId);
  }

  // Internal function called when the Asset needs to be reset (called from either buyAssetInWei or reclaimAsset)
  function resetAsset(uint256 _tokenId) internal {
    // Set all price values equal to 0
    // Set new deadline equal to the base time interval of 12 hours (43200 secs)
    // Set Deposit equal to the current time
    assets[_tokenId].price = 0;
    assets[_tokenId].taxAmount = 0;
    assets[_tokenId].totalDeposit = 0;
    assets[_tokenId].deadline = block.timestamp.add(baseInterval);
    assets[_tokenId].lastDeposit = block.timestamp;
  }

  // Anyone can call this function (does not change state of contract)
  function timeExpired(uint256 _tokenId) public view returns (bool) {
    // First check if the NFT exists
    require(_exists(_tokenId), "Token does not exist");

    // Some debugging to verify time is precisely the same as frontend UI
    console.log("BLOCK TIMESTAMP:", block.timestamp);
    console.log("ASSET DEADLINE:", assets[_tokenId].deadline);

    // Return true if the current time is greater than or equal to the Asset's deadline, otherwise false
    return block.timestamp >= assets[_tokenId].deadline;
  }

  // Anyone can call this function (does not change state of contract)
  function fetchAssets() public view returns(Asset[] memory) {
    // Get the total count of all the assets
    uint256 assetCount = _tokenIds.current();
    // Create a new array to store all the assets
    Asset[] memory totalAssets = new Asset[](assetCount);

    // Loop through the assets mapping and push each one into the new array
    for (uint i = 0; i < assetCount; i++) {
      totalAssets[i] = assets[i + 1];
    }

    // Return an array of all the assets
    return totalAssets;
  }

  // Override inherited (IERC721) function to simply update the require conditional
  function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public virtual override {
    require(
      // Default conditional checks if the user calling this function is either the owner or has been approved to transfer by the owner
      _isApprovedOrOwner(_msgSender(), tokenId) ||
      // OR checks if the user calling this function is the creator of the Asset AND also that time has expired
      _msgSender() == assets[tokenId].creator && timeExpired(tokenId),
      "Transfer caller is not the owner, approved nor the creator"
    );

    // Inherited function call to transfer the NFT
    _safeTransfer(from, to, tokenId, _data);
  }
}
