require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("./tasks/faucet");

module.exports = {
  solidity: "0.8.3",
  paths: {
    artifacts: "./frontend/src/artifacts"
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: "https://eth-rinkeby.alchemyapi.io/v2/" + `${process.env.ALCHEMY_API_KEY}`
      }
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/" + `${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${process.env.RINKEBY_PRIVATE_KEY}`]
    }
  }
};
