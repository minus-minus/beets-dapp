const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const tokenId = 1
const tokenFileName = "./frontend/public/assets/tokens/1.mp4"
const arweaveMediaId = "H_iq8Xlw_7xkVQdhKMkPbwUhqohOtYTf_5rGm9L6HXc"
const ipfsMediaHash = "QmNyeP2AwvkneThVbGHKhHSFLYnaTEyvevhK9rNCNmydAc"
const externalURL = "https://harberger-taxes.d36bhk6ximwheo.amplifyapp.com/harberger-taxes/asset/"

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
    console.log("Media IPFS Hash:", ipfsHash)
  } catch (err) {
    console.log(err)
  }
}

async function pinMetadataToIPFS() {
  const pinJsonUrl = process.env.PINATA_BASE_URI + "pinJSONToIPFS"
  const metadata = {
    pinataMetadata: {
      "name": "harberger-taxes"
    },
    pinataContent: {
      "creator": "Jonathan Mann",
      "description": "Welcome to the land where smart contracts get intertwined in the crosshairs of economics through the power of radical markets. The Harberger Tax Song is ALWAYS on sale. The owner of this asset MUST set a sales price while also paying the corresponding tax rate over a given period of time. The higher the sales price, the higher the amount in taxes that must be deposited in order to extend a foreclosure on the asset. If either of these conditions is failed to be met once the time has expired, the creator of this non-fungible token has the ability to reclaim their rightful asset.",
      "external_url": externalURL + tokenId,
      "image": process.env.ARWEAVE_BASE_URI + arweaveMediaId,
      "ipfs_hash": ipfsMediaHash,
      "name": "The Harberger Tax Song",
      "producer": "BeetsDAO",
      "token_id": tokenId,
      "attributes": [
        {
          "trait_type": "ARTIST",
          "value": "JONATHAN MANN"
        },
        {
          "trait_type": "TOPIC",
          "value": "ETHEREUM"
        },
        {
          "trait_type": "LOCATION",
          "value": "HARTFORD, CT"
        },
        {
          "trait_type": "MOOD",
          "value": "EXCITED"
        },
        {
          "trait_type": "INSTRUMENT",
          "value": "ACOUSTIC GUITAR"
        },
        {
          "trait_type": "SONG A DAY",
          "value": 4625
        }
      ]
    }
  }

  console.log("Metadata:" + "\n", metadata)

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
    saveTokenURI(ipfsHash)
  } catch (err) {
    console.log(err)
  }
}

function saveTokenURI(ipfsHash) {
  const contractsDir = __dirname + "/../frontend/src/contracts"

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }

  fs.writeFileSync(
    contractsDir + "/ipfs.json",
    JSON.stringify({ HarbergerAsset: ipfsHash }, undefined, 2)
  )
}

// pinFileToIPFS()
pinMetadataToIPFS()
