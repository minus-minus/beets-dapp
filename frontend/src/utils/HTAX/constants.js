export const HTAX_CREATOR_ADDRESS = "0xED29CfC3Bd78019e57b3b2BbFf62258a7e674eE5"
export const HTAX_TOKEN_ID = 1
export const HTAX_EVENT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event List(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value)",
  "event Deposit(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to, uint256 value)",
  "event Sale(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value)",
  "event Refund(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to, uint256 value)",
  "event Collect(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value)",
  "event Foreclosure(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to)"
]
