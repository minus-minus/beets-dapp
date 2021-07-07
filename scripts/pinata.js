const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const tokenFileName = "./frontend/public/assets/freestyle.mp4"
const contractsDir = __dirname + "/../frontend/src/contracts"

async function pinFileToIPFS() {
  const pinFileUrl = process.env.PINATA_BASE_URI + "pinFileToIPFS"
  let data = new FormData()
  data.append("file", fs.createReadStream(tokenFileName))

  const header = {
    maxContentLength: "Infinity",
    maxBodyLength: "Infinity",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET_KEY
    }
  }

  const response = await axios.post(pinFileUrl, data, header)

  try {
    const ipfsHash = response.data["IpfsHash"]
    console.log("Media IPFS Hash:", ipfsHash);
    // const arweave = await pinIPFSToArweave(ipfsHash)
    pinMetadataToIPFS(ipfsHash)
  } catch (err) {
    console.log(err)
  }
}

async function pinMetadataToIPFS(ipfsHash) {
  const pinJsonUrl = process.env.PINATA_BASE_URI + "pinJSONToIPFS"
  const metadata =
  {
    pinataMetadata: {
      "name": "harberger-taxes"
    },
    pinataContent: {
      "creator": "Illmaculate",
      "description": "Welcome to the land where smart contracts get intertwined in the crosshairs of economics through the power of radical markets. The Harberger Taxes asset is ALWAYS on sale. The owner of this asset MUST set a sales price while also paying the corresponding tax rate over a given period of time. The higher the sales price, the higher the amount in taxes that must be deposited in order to extend a foreclosure on the asset. If either of these conditions is failed to be met once the time has expired, the creator of this non-fungible token has the ability to reclaim their rightful asset.",
      "external_url": "https://app.beetsdao.com/harberger-taxes/asset/1",
      "image": process.env.IPFS_BASE_URI + ipfsHash,
      "name": "Harberger Taxes",
      "producer": "BeetsDAO",
      "token_id": 1,
    }
  }

  console.log("Metadata:" + "\n", metadata);

  const header = {
    headers: {
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET_KEY
    }
  }

  const response = await axios.post(pinJsonUrl, metadata, header)

  try {
    const ipfsHash = response.data["IpfsHash"]
    console.log("JSON IPFS Hash:", ipfsHash)
    // const arweave = await pinIPFSToArweave(ipfsHash)
    saveTokenURI(ipfsHash)
  } catch (err) {
    console.log(err)
  }
}

// async function pinIPFSToArweave(ipfsHash) {
//   const permapinUrl = process.env.ARWEAVE_PERMAPIN_URI + ipfsHash
//   const response = await axios.post(permapinUrl)
//
//   try {
//     const arweaveId = response.data.arweaveId
//     console.log("Arweave ID:", arweaveId)
//     return arweaveId
//   } catch (err) {
//     console.log(err)
//   }
// }

function saveTokenURI(ipfsHash) {
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }

  fs.writeFileSync(
    contractsDir + "/ipfs.json",
    JSON.stringify({ HarbergerAsset: ipfsHash }, undefined, 2)
  )

  // fs.writeFileSync(
  //   contractsDir + "/arweave.json",
  //   JSON.stringify({ HarbergerAsset: arweaveId }, undefined, 2)
  // )
}

pinFileToIPFS()
