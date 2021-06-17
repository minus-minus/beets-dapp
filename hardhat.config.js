require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("./tasks/faucet");

module.exports = {
  solidity: "0.8.3",
  paths: {
    artifacts: './frontend/src/artifacts'
  },
  networks: {
    hardhat: {
      chainId: 1337,
      // forking: {
      //   url: "https://eth-mainnet.alchemyapi.io/v2/Rz6eIxUOE7wjSHFw33d31XxNT5XAVcYj"
      // }
    }
  }
};
