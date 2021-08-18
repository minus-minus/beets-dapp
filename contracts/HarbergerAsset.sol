// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
//                                                                             //
//      ██████╗░███████╗███████╗████████╗░██████╗██████╗░░█████╗░░█████╗░      //
//      ██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔══██╗██╔══██╗      //
//      ██████╦╝█████╗░░█████╗░░░░░██║░░░╚█████╗░██║░░██║███████║██║░░██║      //
//      ██╔══██╗██╔══╝░░██╔══╝░░░░░██║░░░░╚═══██╗██║░░██║██╔══██║██║░░██║      //
//      ██████╦╝███████╗███████╗░░░██║░░░██████╔╝██████╔╝██║░░██║╚█████╔╝      //
//      ╚═════╝░╚══════╝╚══════╝░░░╚═╝░░░╚═════╝░╚═════╝░╚═╝░░╚═╝░╚════╝░      //
//                                                                             //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/*
 * External Sources:
 * https://github.com/yosriady/PatronageCollectibles
 * https://github.com/simondlr/thisartworkisalwaysonsale
 */

/**
 * @author swaHili
 * @title HarbergerAsset
 * @dev Assets are controlled through the property rights enforced by Harberger taxation
 */
contract HarbergerAsset is ERC721URIStorage, ReentrancyGuard {
  using SafeMath for uint256;
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // Owner of contract
  address public admin;

  // Base time interval in seconds used to calculate foreclosure date (24 hours)
  uint256 public constant baseInterval = 86400 seconds;

  // Prepend baseURI to Arweave ID to create tokenURI
  string  public constant baseURI = "https://arweave.net/";

  // Percentage of sales price shows how royalty amount is calculated
  uint256 public royaltyPercentage = 10;

  // Percentage of sales price shows how tax amount is calculated
  uint256 public taxPercentage = 10;

  // Denominator used to calculate royalty amount
  uint256 private royaltyDenominator = 100 / royaltyPercentage;

  // Denominator used to calculate tax amount
  uint256 private taxDenominator = 100 / taxPercentage;

  // Mapping tokenId to Asset struct
  mapping(uint64 => Asset) public assets;

  // Mapping tokenId to base tax value in wei which is used to calculate foreclosure date
  mapping(uint64 => uint256) public baseTaxValues;

  // Mapping tokenId to IPFS CID Hash
  mapping(uint64 => string) public ipfsHash;

  // Mapping tokenId to address of tax collector account
  mapping(uint64 => address) public taxCollectors;

  /**
   * @dev Object that represents the current state of each asset
   * `tokenId` ID of the token
   * `creator` Address of the artist who created the asset
   * `priceAmount` Price amount in wei of the asset
   * `taxAmount` Tax amount in wei of the asset
   * `totalDepositAmount` Total amount deposited in wei by the current owner of the asset
   * `lastDepositTimestamp` Timestamp of the last tax deposit performed by the current owner
   * `foreclosureTimestamp` Timestamp of the foreclosure for which taxes must be paid by the current owner
   */
  struct Asset {
    uint64 tokenId;
    address creator;
    uint256 priceAmount;
    uint256 taxAmount;
    uint256 totalDepositAmount;
    uint256 lastDepositTimestamp;
    uint256 foreclosureTimestamp;
  }

  /**
   * @dev List of possible events emitted after every transaction.
   */
  event Mint       (uint256 indexed timestamp, uint64 indexed tokenId, address indexed from, address to);
  event List       (uint256 indexed timestamp, uint64 indexed tokenId, address indexed from, uint256 value);
  event Deposit    (uint256 indexed timestamp, uint64 indexed tokenId, address indexed from, address to, uint256 value);
  event Sale       (uint256 indexed timestamp, uint64 indexed tokenId, address indexed from, address to, uint256 value);
  event Refund     (uint256 indexed timestamp, uint64 indexed tokenId, address indexed from, address to, uint256 value);
  event Collect    (uint256 indexed timestamp, uint64 indexed tokenId, address indexed from, address to, uint256 value);
  event Foreclosure(uint256 indexed timestamp, uint64 indexed tokenId, address indexed from, address to);

  /**
   * @dev Initializes contract and sets `admin` to specified owner of contract.
   * @param _admin Address of the contract admin
   */
  constructor(address _admin) ERC721("HarbergerAsset", "ASSET") {
    admin = _admin;
  }

  /**
   * @dev Modifier that checks if `admin` is equal to `msgSender()`.
   */
  modifier onlyAdmin() {
    require(admin == _msgSender(), "You are not authorized to perform this action");
    _;
  }

  /**
   * @dev Modifier that checks if `creator` of asset is equal to `msgSender()`.
   * @param _tokenId ID of the token
   */
  modifier onlyCreator(uint64 _tokenId) {
    require(assets[_tokenId].creator == _msgSender(), "You are not the creator of this asset");
    _;
  }

  /**
   * @dev Modifier that checks if `admin` or `creator` of asset is equal to `msgSender()`.
   * @param _tokenId ID of the token
   */
  modifier onlyAdminOrCreator(uint64 _tokenId) {
    require(admin == _msgSender() || assets[_tokenId].creator == _msgSender(), "You are not the admin nor creator of this asset");
    _;
  }

  /**
   * @dev Modifier that checks if `owner` of asset is equal to `msgSender()`.
   * @param _tokenId ID of the token
   */
  modifier onlyOwner(uint64 _tokenId) {
    require(ownerOf(_tokenId) == _msgSender(), "You are not the owner of this asset");
    _;
  }

  /**
   * @dev Modifier that checks if `tokenId` exists.
   * @param _tokenId ID of the token
   */
  modifier validToken(uint64 _tokenId) {
    require(_exists(_tokenId), "Token does not exist");
    _;
  }

  /**
   * @dev See {IERC721-baseURI}.
   */
  function _baseURI() override internal view virtual returns (string memory) {
    return baseURI;
  }

  /**
   * @dev Mints `tokenId`, transfers it to `creator`, sets `tokenURI` and initializes asset state.
   * @param _arweaveId Arweave ID used to create tokenURI
   * @param _ipfsHash IPFS CID Hash generated from JSON metadata
   * @param _creator Address of artist who created the asset
   * @param _taxCollector Address of tax collector account
   * @return the newly created `tokenId`
   *
   * Requirements:
   *
   * - `admin` must be equal to `msgSender()`.
   *
   * Emits a {Mint & Transfer} event.
   */
  function mintAsset(string memory _arweaveId, string memory _ipfsHash, address _creator, address _taxCollector) public onlyAdmin returns (uint256) {
    _tokenIds.increment();
    uint64 newItemId = uint64(_tokenIds.current());

    emit Mint(block.timestamp, newItemId, address(0), _creator);

    _safeMint(_creator, newItemId);
    _setTokenURI(newItemId, _arweaveId);
    ipfsHash[newItemId] = _ipfsHash;

    initializeAsset(newItemId, _creator);
    taxCollectors[newItemId] = _taxCollector;
    baseTaxValues[newItemId] = 10000000000000000; // .01 ETH

    return newItemId;
  }

  /**
   * @dev Lists asset for sale in wei and sets corresponding tax price in wei.
   * @param _tokenId ID of the token
   * @param _priceAmount Price amount in wei of the asset
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `owner` of asset must be equal to `msgSender()`.
   * - 'priceAmount' of asset must be greater than 0.
   * - 'foreclosure()' of asset must not be in process OR `msgSender()` must be equal to creator OR `msgSender() must be equal to admin`.
   *
   * Emits a {List} event.
   */
  function listAssetForSaleInWei(uint64 _tokenId, uint256 _priceAmount) public validToken(_tokenId) onlyOwner(_tokenId) {
    require(_priceAmount > 0, "You must set a sales price greater than 0");
    require(
      foreclosure(_tokenId) == false ||
      assets[_tokenId].creator == _msgSender() ||
      admin == _msgSender(),
      "A foreclosure on this asset has already begun"
    );

    assets[_tokenId].priceAmount = _priceAmount;
    assets[_tokenId].taxAmount = _priceAmount.div(taxDenominator);

    emit List(block.timestamp, _tokenId, _msgSender(), _priceAmount);
  }

  /**
   * @dev Deposits taxes into contract.
   * @param _tokenId ID of the token
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `owner` of asset must be equal to `msgSender()`.
   * - `priceAmount` of asset must be greater than 0.
   * - `msg.value` must be greater than or equal to `taxAmount`.
   * - 'foreclosure()' of asset must not be in process.
   *
   * Emits a {Deposit} event.
   */
  function depositTaxInWei(uint64 _tokenId) public payable validToken(_tokenId) onlyOwner(_tokenId) nonReentrant() {
    require(assets[_tokenId].priceAmount > 0, "You must first set a sales price");
    require(msg.value >= assets[_tokenId].taxAmount, "Your tax deposit must not be less than the current tax price");
    require(foreclosure(_tokenId) == false, "A foreclosure on this asset has already begun");

    uint256 baseTaxValue = baseTaxValues[_tokenId];
    uint256 taxMultiplier = msg.value.div(baseTaxValue);

    assets[_tokenId].foreclosureTimestamp += baseInterval.mul(taxMultiplier);
    assets[_tokenId].lastDepositTimestamp = block.timestamp;
    assets[_tokenId].totalDepositAmount += msg.value;

    emit Deposit(block.timestamp, _tokenId, _msgSender(), address(this), msg.value);
  }

  /**
   * @dev Purchase of asset triggers tax refund, payment transfers and asset transfer.
   * @param _tokenId ID of the token
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `owner` of asset must not be equal to `msgSender()`.
   * - `priceAmount` of asset must be greater than 0.
   * - `priceAmount` of asset must be equal to `msg.value`.
   *
   * Emits a {Sale} event.
   */
  function buyAssetInWei(uint64 _tokenId) public payable validToken(_tokenId) nonReentrant() {
    require(ownerOf(_tokenId) != _msgSender(), "You are already the owner of this asset");
    require(assets[_tokenId].priceAmount > 0, "This asset is currently not up for sale");
    require(assets[_tokenId].priceAmount == msg.value, "Invalid payment amount");

    address creator = assets[_tokenId].creator;
    address currentOwner = ownerOf(_tokenId);
    uint256 refundAmount = refundTax(_tokenId, currentOwner);

    collectFunds(_tokenId, currentOwner, refundAmount);
    initializeAsset(_tokenId, creator);

    transferPayments(msg.value, currentOwner, creator);
    emit Sale(block.timestamp, _tokenId, _msgSender(), currentOwner, msg.value);
    this.safeTransferFrom(currentOwner, _msgSender(), _tokenId);
  }

  /**
   * @dev Refunds `currentOwner` the remaining tax amount. Since taxes are paid in advance based on a time interval,
     if the asset is purchased before the foreclosure date is reached, the `currentOwner` receives a portion of those taxes back.
     The refund calculation is simply the reverse of how the asset foreclosure date is calculated.
   * @param _tokenId ID of the token
   * @param _currentOwner Address of current owner of the asset
   * @return refund amount from excess of taxes deposited
   *
   * Emits a {Refund} event if `timeRemaining` is more than `baseInterval`.
   */
  function refundTax(uint64 _tokenId, address _currentOwner) internal returns(uint256) {
    if (_currentOwner == assets[_tokenId].creator || _currentOwner == admin) return 0;

    uint256 foreclosureTimestamp = assets[_tokenId].foreclosureTimestamp;

    if (foreclosureTimestamp > block.timestamp.add(baseInterval)) {
      uint256 remainingTimestamp = foreclosureTimestamp.sub(block.timestamp);
      uint256 taxMultiplier = remainingTimestamp.div(baseInterval);
      uint256 baseTaxValue = baseTaxValues[_tokenId];
      uint256 refundAmount = baseTaxValue.mul(taxMultiplier);

      payable(_currentOwner).transfer(refundAmount);
      emit Refund(block.timestamp, _tokenId, address(this), _currentOwner, refundAmount);

      return refundAmount;
    }

    return 0;
  }

  /**
   * @dev Transfers deposit amount after refund to tax collector account.
   * @param _tokenId ID of the token
   * @param _currentOwner Address of current owner of the asset
   * @param _refundAmount Amount refunded to current owner
   */
  function collectFunds(uint64 _tokenId, address _currentOwner, uint256 _refundAmount) internal {
    if (_currentOwner == assets[_tokenId].creator || _currentOwner == admin) return;

    address taxCollector = taxCollectors[_tokenId];
    uint256 totalDepositAmount = assets[_tokenId].totalDepositAmount;
    uint256 depositAfterRefund = totalDepositAmount.sub(_refundAmount);

    payable(taxCollector).transfer(depositAfterRefund);
  }

  /**
   * @dev Transfers royalties to `admin` and `creator` of asset and transfers remaining payment to `currentOwner`.
   * @param _payment Value in wei paid by the new owner
   * @param _currentOwner Address of current owner of the asset
   * @param _creator Address of artist who created the asset
   */
  function transferPayments(uint256 _payment, address _currentOwner, address _creator) internal {
    uint256 royaltyAmount = _payment.div(royaltyDenominator);
    uint256 paymentAmount = _payment.sub(royaltyAmount);

    payable(admin).transfer(royaltyAmount.div(2));
    payable(_creator).transfer(royaltyAmount.div(2));
    payable(_currentOwner).transfer(paymentAmount);
  }

  /**
   * @dev Reclaims asset and transfers it back to `creator`.
   * @param _tokenId ID of the token
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `creator` must be equal to `msgSender()`.
   * - `foreclosure()` of asset must be equal to true.
   * - `creator` must not be current owner of the asset.
   *
   * Emits a {Foreclosure} event.
   */
  function reclaimAsset(uint64 _tokenId) public validToken(_tokenId) onlyAdminOrCreator(_tokenId) {
    require(foreclosure(_tokenId), "Time has not yet expired for you to reclaim this asset");
    require(ownerOf(_tokenId) != _msgSender(), "You are already the owner of this asset");

    address currentOwner = ownerOf(_tokenId);
    emit Foreclosure(block.timestamp, _tokenId, _msgSender(), currentOwner);

    safeTransferFrom(currentOwner, _msgSender(), _tokenId);
    initializeAsset(_tokenId, assets[_tokenId].creator);
  }

  /**
   * @dev Checks if current time is greater than `foreclosure` timestamp of asset.
   * @param _tokenId ID of the token
   * @return boolean value to determine status of asset foreclosure
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   */
  function foreclosure(uint64 _tokenId) public view validToken(_tokenId) returns (bool) {
    return block.timestamp >= assets[_tokenId].foreclosureTimestamp;
  }

  /**
   * @dev Resets asset to initial state.
   * @param _tokenId ID of the token
   * @param _creator Address of the creator of the asset
   */
  function initializeAsset(uint64 _tokenId, address _creator) internal {
    assets[_tokenId].tokenId = _tokenId;
    assets[_tokenId].creator = _creator;
    assets[_tokenId].priceAmount = 0;
    assets[_tokenId].taxAmount = 0;
    assets[_tokenId].totalDepositAmount = 0;
    assets[_tokenId].lastDepositTimestamp = block.timestamp;
    assets[_tokenId].foreclosureTimestamp = block.timestamp.add(baseInterval);
  }

  /**
   * @dev Updates the `admin` account.
   * @param _account Address of new admin account
   *
   * Requirements:
   *
   * - `admin` must be equal to `_msgSender()`.
   * - `address` must be different than the current account.
   */
  function setAdmin(address _account) public onlyAdmin {
    require(admin != _account, "New address must be different than the current account");

    admin = _account;
  }

  /**
   * @dev Updates the mapping value of `baseTaxValues`.
   * @param _tokenId ID of the token
   * @param _amount New base tax value in wei
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `creator` must be equal to `_msgSender()`.
   * - `creator` may only update value if they are also the owner of the asset.
   * - `amount` must be different than the current value.
   */
  function setBaseTaxValueInWei(uint64 _tokenId, uint256 _amount) public validToken(_tokenId) onlyCreator(_tokenId) onlyOwner(_tokenId) {
    require(baseTaxValues[_tokenId] != _amount, "New amount must be different than the current value");

    baseTaxValues[_tokenId] = _amount;
  }

  /**
   * @dev Updates the state variable `royaltyPercentage`.
   * @param _percentage New royalty percentage
   *
   * Requirements:
   *
   * - `admin` must be equal to `msgSender()`.
   * - `percentage` must be different than the current value.
   */
  function setRoyaltyPercentage(uint256 _percentage) public onlyAdmin {
    require(royaltyPercentage != _percentage, "New percentage must be different than the current value");

    royaltyPercentage = _percentage;
  }

  /**
   * @dev Updates the state variable `taxPercentage`.
   * @param _percentage New tax percentage
   *
   * Requirements:
   *
   * - `admin` must be equal to `msgSender()`.
   * - `percentage` must be different than the current value.
   */
  function setTaxPercentage(uint256 _percentage) public onlyAdmin {
    require(taxPercentage != _percentage, "New value must be different than the current value");

    taxPercentage = _percentage;
  }

  /**
   * @dev See {IERC721-safeTransferFrom}.
   *
   * Requirements:
   *
   * - `currentOwner` or `approvedAccount` must be equal to `msgSender()` OR
   * - `admin` or `creator` must be equal to `msgSender()` AND `foreclosure()` of asset must be equal to true.
   */
  function safeTransferFrom(
      address from,
      address to,
      uint256 tokenId,
      bytes memory _data
    ) public virtual override {
    uint64 _tokenId = uint64(tokenId);
    require(
      _isApprovedOrOwner(_msgSender(), _tokenId) ||
      ((admin == _msgSender() || assets[_tokenId].creator == _msgSender()) && foreclosure(_tokenId)),
      "Transfer caller is not owner nor approved OR a foreclosure on this asset has not yet begun"
    );

    _safeTransfer(from, to, tokenId, _data);
  }
}
