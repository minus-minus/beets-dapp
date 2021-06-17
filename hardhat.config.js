require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");

module.exports = {
  solidity: "0.8.3",
  paths: {
    artifacts: './frontend/src/artifacts'
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/Rz6eIxUOE7wjSHFw33d31XxNT5XAVcYj"
      }
    }
  }
};
