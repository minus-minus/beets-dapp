export const HTAX_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
export const HTAX_CREATOR_ADDRESS = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
export const HTAX_IPFS_HASH = "QmTfgEPgSuTLEUxLMnkQpwjtWpR1MuyEQ6EKV1CPWPh14i"
export const HTAX_TOKEN_ID = 1
export const HTAX_EVENT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Mint(address indexed _from, address indexed _to, uint256 indexed _tokenId)",
  "event List(address indexed _from, uint256 indexed _tokenId, uint256 indexed _price)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event Deposit(address indexed _from, uint256 indexed _tokenId, uint256 indexed _taxAmount)",
  "event Sale(address indexed _from, uint256 indexed _tokenId, uint256 indexed _amount)",
  "event Collect(address indexed _from, uint256 indexed _tokenId, uint256 indexed _taxFund)",
  "event Reclaim(address indexed _from, address indexed _to, uint256 indexed _tokenId)"
]
