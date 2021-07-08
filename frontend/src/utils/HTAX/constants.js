export const HTAX_CREATOR_ADDRESS = "0xeC161Eda65E3470607949F9bCE4e1f7C5af95727"
export const HTAX_TOKEN_ID = 1
export const HTAX_EVENT_ABI = [
  "event Mint(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event List(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value)",
  "event Deposit(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to, uint256 value)",
  "event Sale(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value)",
  "event Refund(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to, uint256 value)",
  "event Collect(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value)",
  "event Foreclosure(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to)"
]
