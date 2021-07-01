# Hardhat Hackathon Boilerplate

This repository contains a sample project that you can use as the starting point
for your Ethereum project. It's also a great fit for learning the basics of
smart contract development.

This project is intended to be used with the
[Hardhat Beginners Tutorial](https://hardhat.org/tutorial), but you should be
able to follow it by yourself by reading the README and exploring its
`contracts`, `tests`, `scripts` and `frontend` directories.

## Quick start

The first things you need to do are cloning this repository and installing its
dependencies:

```sh
git clone https://github.com/nomiclabs/hardhat-hackathon-boilerplate.git
cd hardhat-hackathon-boilerplate
npm install
```

Once installed, let's run Hardhat's testing network:

```sh
npx hardhat node
```

Then, on a new terminal, go to the repository's root folder and run this to
deploy your contract:

```sh
npx hardhat run scripts/deploy.js --network localhost
```

Finally, we can run the frontend with:

```sh
cd frontend
npm install
npm start
```

> Note: There's [an issue in `ganache-core`](https://github.com/trufflesuite/ganache-core/issues/650) that can make the `npm install` step fail.
>
> If you see `npm ERR! code ENOLOCAL`, try running `npm ci` instead of `npm install`.

Open [http://localhost:3000/](http://localhost:3000/) to see your Dapp. You will
need to have [Metamask](https://metamask.io) installed and listening to
`localhost 8545`.

## User Guide

You can find detailed instructions on using this repository and many tips in [its documentation](https://hardhat.org/tutorial).

- [Project description (Token.sol)](https://hardhat.org/tutorial/4-contracts/)
- [Setting up the environment](https://hardhat.org/tutorial/1-setup/)
- [Testing with Hardhat, Mocha and Waffle](https://hardhat.org/tutorial/5-test/)
- [Setting up Metamask](https://hardhat.org/tutorial/8-frontend/#setting-up-metamask)
- [Hardhat's full documentation](https://hardhat.org/getting-started/)

For a complete introduction to Hardhat, refer to [this guide](https://hardhat.org/getting-started/#overview).

## What’s Included?

Your environment will have everything you need to build a Dapp powered by Hardhat and React.

- [Hardhat](https://hardhat.org/): An Ethereum development task runner and testing network.
- [Mocha](https://mochajs.org/): A JavaScript test runner.
- [Chai](https://www.chaijs.com/): A JavaScript assertion library.
- [ethers.js](https://docs.ethers.io/ethers.js/html/): A JavaScript library for interacting with Ethereum.
- [Waffle](https://github.com/EthWorks/Waffle/): To have Ethereum-specific Chai assertions/mathers.
- [A sample frontend/Dapp](./frontend): A Dapp which uses [Create React App](https://github.com/facebook/create-react-app).

## Troubleshooting

- `Invalid nonce` errors: if you are seeing this error on the `npx hardhat node`
  console, try resetting your Metamask account. This will reset the account's
  transaction history and also the nonce. Open Metamask, click on your account
  followed by `Settings > Advanced > Reset Account`.

## Feedback, help and news

We'd love to have your feedback on this tutorial. Feel free to reach us through
this repository or [our Discord server](https://invite.gg/HardhatSupport).

Also you can [follow us on Twitter](https://twitter.com/HardhatHQ).

**Happy _buidling_!**


## Harberger Taxes Setup

1. `git pull origin harberger-taxes`

2. `git co harberger-taxes`

3. `npm ci`

4. `cd frontend`

5. `npm ci`

6. Create `.env` file in root dir and add the following:
```
ALCHEMY_API_KEY=
ARWEAVE_BASE_URI=https://arweave.net/
ARWEAVE_PERMAPIN_URI=https://ipfs2arweave.com/permapin/
HARDHAT_PRIVATE_KEY=
INFURA_PROJECT_ID=
INFURA_PROJECT_SECRET=
IPFS_BASE_URI=https://ipfs.io/ipfs/
PINATA_API_KEY=
PINATA_BASE_URI=https://api.pinata.cloud/pinning/
PINATA_SECRET_KEY=
```

7. Open new window in root dir and run `npx hardhat node`

8. Open new window once again in root dir and run `npx hardhat run scripts/pinata.js` in order to store generated IPFS hash

9. Then run `npx hardhat run scripts/deploy.js --network localhost` to deploy contract locally

10. Open new window and `cd frontend`

11. `npm start`

12. Import the first 3 Hardhat accounts into MetaMask using the private keys that are logged from the hardhat node server

13. The first account that deploys the contract will be the `Admin` and will be able to `Mint Token` and `Collect Funds`

14. The second account is set to be the `Creator` of the NFT and will be able to `Reclaim Asset` and `Collect Funds`

15. The third account is considered to be a normal user and will only have basic actions available
