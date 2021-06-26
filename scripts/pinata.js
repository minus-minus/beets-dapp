const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const tokenFileName = "./frontend/public/space.jpg"
const contractsDir = __dirname + "/../frontend/src/contracts"

async function pinFileToIPFS() {
  const pinFileUrl = process.env.PINATA_BASE_URI + "/pinFileToIPFS"
  let data = new FormData()
  data.append("file", fs.createReadStream(tokenFileName))

  const header = {
    maxContentLength: "Infinity",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET_KEY
    }
  }

  const response = await axios.post(pinFileUrl, data, header)

  try {
    const ipfsHash = response.data["IpfsHash"]
    console.log("Image Hash:", ipfsHash);
    pinMetadata(ipfsHash)
  } catch (err) {
    console.log(err)
  }
}

async function pinMetadata(hash) {
  const pinJsonUrl = process.env.PINATA_BASE_URI + "/pinJSONToIPFS"
  const metadata =
  {
    pinataContent: {
      "artist": "Jonathan Mann",
      "creator": "@songadaymann",
      "description": "Welcome to the land where smart contracts get intertwined in the crosshairs of economics. The Harberger Taxes song is ALWAYS on sale. The owner of this asset MUST set a sales price while also paying the corresponding tax rate over a given period of time. The higher the sales price, the higher the amount in taxes that must be deposited in order to extend the clock. If either of these conditions is failed to be met once the time expires, the creator of this non-fungible token has the ability to reclaim their rightful asset.",
      "image": process.env.IPFS_BASE_URI + hash,
      "name": "Harberger Taxes",
      "producer": "BeetsDAO",
      "token_id": 1,
      "website": "https://www.beetsdao.com/harberger-taxes"
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
    console.log("JSON Hash:", ipfsHash)
    saveFrontendFiles(ipfsHash)
  } catch (err) {
    console.log(err)
  }
}

function saveFrontendFiles(ipfsHash) {
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }

  fs.writeFileSync(
    contractsDir + "/ipfs-hash.json",
    JSON.stringify({ HarbergerAsset: ipfsHash }, undefined, 2)
  )
}

pinFileToIPFS()
