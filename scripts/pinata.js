const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const basePinataURI = "https://api.pinata.cloud/pinning"
const baseIpfsURI = "https://ipfs.io/ipfs/"
const fileName = "./frontend/public/space.jpg"

async function pinFileToIPFS() {
  const pinFileUrl = basePinataURI + "/pinFileToIPFS"
  let data = new FormData()
  data.append("file", fs.createReadStream(fileName))

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
  const pinJsonUrl = basePinataURI + "/pinJSONToIPFS"
  const metadata =
  {
    pinataMetadata: {
      "name": "space-metadata"
    },
    pinataContent: {
      "name": "Stary Night",
      "artist": "Vincent Van Go",
      "description": "A painting of the night sky",
      "image": baseIpfsURI + hash,
      "attributes": []
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
  const contractsDir = __dirname + "/../frontend/src/contracts"

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }

  fs.writeFileSync(
    contractsDir + "/ipfs-hash.json",
    JSON.stringify({ HarbergerAsset: ipfsHash }, undefined, 2)
  )
}

pinFileToIPFS()
