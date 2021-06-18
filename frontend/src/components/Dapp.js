import React from "react";
import { ethers } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import contractAddress from "../contracts/contract-address.json";
import HTAX_ARTIFACT from "../contracts/HarbergerAsset.json";
import { HTAX_EVENT_ABI, HTAX_TOKEN_ID } from "../utils/HTAX/constants";
import { ENIGMA_ABI } from "../utils/EB/EulerBeatsAbi";
import { ENIGMA_TOKEN_CONTRACT_ADDRESS } from "../utils/EB/constants";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import HarbergerAsset from "./HarbergerAsset";
// import { Transfer } from "./Transfer";
// import { TransactionErrorMessage } from "./TransactionErrorMessage";
// import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
// import { NoTokensMessage } from "./NoTokensMessage";
// import { PrintList } from './PrintList';

// This is the Hardhat Network id, you might change it in the hardhat.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = '1337';

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// Library for API request
const axios = require('axios');

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The user's address and balance
      selectedAddress: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      isLoadingContract: true,
      isLoadingToken: true,
      isLoadingMetadata: true
    };

    this.loadContractData = this.loadContractData.bind(this)
    this.loadTokenData = this.loadTokenData.bind(this)
    this.apiRequest = this.apiRequest.bind(this)
    this.mintToken = this.mintToken.bind(this)
    this.setApproval = this.setApproval.bind(this)
    this.listAsset = this.listAsset.bind(this)
    this.depositTax = this.depositTax.bind(this)
    this.buyAsset = this.buyAsset.bind(this)
    this.collectFunds = this.collectFunds.bind(this)
    this.reclaimAsset = this.reclaimAsset.bind(this)

    this.state = this.initialState;
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <div>
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
        </div>
      );
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    if (this.state.isLoadingWallet) {
      return <Loading />;
    }

    // If everything is loaded, we render the application.
    // return <PrintList mintPrint={(originalTokenId, price) => this.mintPrint(originalTokenId, price)}
    //                   getTrackSupply={(originalTokenId) => this.getTrackSupply(originalTokenId)}
    //                   getTrackPrice={(printSupply) => this.getTrackPrice(printSupply)} />
    return (
      <HarbergerAsset
        artist={this.state.assetCreator}
        mintToken={this.mintToken}
        selectedAddress={this.state.selectedAddress}
        tokenURI={this.state.tokenURI}
      />
    )
  }

  async _connectWallet() {
    this.setState({isLoadingWallet: true})
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(accounts[0]);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on("chainChanged", ([networkId]) => {
      this._resetState();
    });

    setTimeout(() => this.setState({isLoadingWallet: false}), 2000)
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._intializeEthers();
    this.loadContractData();
  }

  async _intializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    this.EBcontract = new ethers.Contract(
      ENIGMA_TOKEN_CONTRACT_ADDRESS,
      ENIGMA_ABI,
      this._provider.getSigner()
    )

    this.HTAXcontract = new ethers.Contract(
      contractAddress.HarbergerAsset,
      HTAX_ARTIFACT.abi,
      this._provider.getSigner()
    )
  }

  async loadContractData() {
    const contractAdmin = await this.HTAXcontract.admin();
    const contractBalance = await this._provider.getBalance(contractAddress.HarbergerAsset);

    const logs = await this._provider.getLogs({ address: contractAddress.HarbergerAsset, fromBlock: 0 });
    const iface = new ethers.utils.Interface(HTAX_EVENT_ABI);
    const eventsLogs = logs.map(async (log, i) => {
      const block = await this._provider.getBlock(logs[i].blockNumber);
      if (!block) return;
      return Object.assign(iface.parseLog(log), {blockNumber: block.number, timestamp: block.timestamp});
    })

    this.setState({
      contractAddress: contractAddress.HarbergerAsset,
      contractAdmin: contractAdmin,
      contractBalance: contractBalance.toString(),
      eventsLogs: eventsLogs,
      isLoadingContract: false
    })

    console.log("HTAX Contract State:", this.state);
    this.loadTokenData();
  }

  async loadTokenData() {
    try {
      const asset = await this.HTAXcontract.assets(HTAX_TOKEN_ID);
      const assetOwner = await this.HTAXcontract.ownerOf(HTAX_TOKEN_ID);
      const approvedAccount = await this.HTAXcontract.getApproved(HTAX_TOKEN_ID);
      const timeExpired = await this.HTAXcontract.timeExpired(HTAX_TOKEN_ID);
      const tokenURI = await this.HTAXcontract.tokenURI(HTAX_TOKEN_ID);
      const taxRate = await this.HTAXcontract.taxPercentage();
      const baseInterval = await this.HTAXcontract.baseInterval();
      const adminBalance = await this.HTAXcontract.balances(HTAX_TOKEN_ID, this.state.contractAdmin);
      const creatorBalance = await this.HTAXcontract.balances(HTAX_TOKEN_ID, asset.creator);

      this.setState({
        adminBalance: adminBalance.toString(),
        assetCreator: asset.creator,
        assetDeadline: asset.deadline.toString(),
        assetLastDeposit: asset.lastDeposit.toString(),
        assetOwner: assetOwner,
        assetPrice: asset.price.toString(),
        assetTaxAmount: asset.taxAmount.toString(),
        assetTotalDeposit: asset.totalDeposit.toString(),
        approvedAccount: approvedAccount,
        baseInterval: baseInterval.toString(),
        creatorBalance: creatorBalance.toString(),
        taxRate: `${taxRate}%`,
        timeExpired: timeExpired,
        tokenURI: tokenURI,
        isLoadingToken: false
      })

      console.log("HTAX Token State:", this.state);
      this.apiRequest();
    } catch(err) {
      const msg = err.data ? err.data.message.split('revert ')[1] : err.message
      this.setState({ transactionError: msg });
      console.error(this.state);
    }
  }

  async apiRequest() {
    try {
      const tokenURI = this.state.tokenURI;
      const response = await axios.get(tokenURI);

      this.setState({
        tokenArtist: response.data.artist,
        tokenDescription: response.data.description,
        tokenImage: response.data.image,
        tokenName: response.data.name,
        isLoadingMetadata: false
      })

      console.log("HTAX Metadata State:", this.state);
    } catch(err) {
      const msg = err.data ? err.data.message.split('revert ')[1] : err.message
      this.setState({ transactionError: msg });
      console.error(this.state);
    }
  }

  async mintToken(ipfsHash) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

    try {
      // console.log(ipfsHash)
      const transaction = await contract.mintToken(ipfsHash);
      const receipt = await transaction.wait();

      console.log("Transaction Receipt:", receipt);
      this.loadContractData();
    } catch(err) {
      const msg = err.data ? err.data.message.split('revert ')[1] : err.message
      this.setState({ transactionError: msg });
      console.error(this.state);
    }
  }

  async listAsset(amount) {
    if (this.state.approvedAccount !== contractAddress) {
      this.setApproval();
    } else {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

      try {
        const transaction = await contract.listAssetForSaleInWei(HTAX_TOKEN_ID, amount);
        const receipt = await transaction.wait();

        console.log("Transaction Receipt:", receipt);
        this.loadContractData();
      } catch(err) {
        const msg = err.data ? err.data.message.split('revert ')[1] : err.message
        this.setState({ transactionError: msg });
        console.error(this.state);
      }
    }
  }

  async setApproval() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

    try {
      const transaction = await contract.approve(contractAddress.HarbergerAsset, HTAX_TOKEN_ID);
      const receipt = await transaction.wait();

      console.log("Transaction Receipt:", receipt);
      this.loadContractData();
    } catch(err) {
      const msg = err.data ? err.data.message.split('revert ')[1] : err.message
      this.setState({ transactionError: msg });
      console.error(this.state);
    }
  }

  async depositTax(amount) {
    if (this.state.approvedAccount !== contractAddress.HarbergerAsset) {
      this.setApproval();
    } else {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

      try {
        const transaction = await contract.depositTaxInWei(HTAX_TOKEN_ID, { value: amount });
        const receipt = await transaction.wait();

        console.log("Transaction Receipt:", receipt);
        this.loadContractData();
      } catch(err) {
        const msg = err.data ? err.data.message.split('revert ')[1] : err.message
        this.setState({ transactionError: msg });
        console.error(this.state);
      }
    }
  }

  async buyAsset() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

    try {
      const transaction = await contract.buyAssetInWei(HTAX_TOKEN_ID, { value: this.state.assetPrice });
      const receipt = await transaction.wait();

      console.log("Transaction Receipt:", receipt);
      this.loadContractData();
    } catch(err) {
      const msg = err.data ? err.data.message.split('revert ')[1] : err.message
      this.setState({ transactionError: msg });
      console.error(this.state);
    }
  }

  async collectFunds() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

    try {
      const transaction = await contract.collectFunds(HTAX_TOKEN_ID);
      const receipt = await transaction.wait();

      console.log("Transaction Receipt:", receipt);
      this.loadContractData();
    } catch(err) {
      const msg = err.data ? err.data.message.split('revert ')[1] : err.message
      this.setState({ transactionError: msg });
      console.error(this.state);
    }
  }

  async reclaimAsset() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

    try {
      const transaction = await contract.reclaimAsset(HTAX_TOKEN_ID);
      const receipt = await transaction.wait();

      console.log("Transaction Receipt:", receipt);
      this.loadContractData();
    } catch(err) {
      const msg = err.data ? err.data.message.split('revert ')[1] : err.message
      this.setState({ transactionError: msg });
      console.error(this.state);
    }
  }

  async getTrackSupply(originalTokenId) {
    console.log("contractInstance", this.EBcontract);
    return await this.EBcontract.seedToPrintsSupply(originalTokenId);
  }

  async getTrackPrice(supplyCount) {
    console.log("contractInstance", this.EBcontract);
    return await this.EBcontract.getPrintPrice(supplyCount);
  }

  async mintPrint(originalTokenId, price) {
    console.log("contractInstance", this.EBcontract);
    const originalOwner = '0xf47f5A7F2917800149f638E9f0eD3745D16481C6';
    try {
      const tx = await this.EBcontract.mintPrint(originalTokenId, originalOwner, {
        value: price,
        gasLimit: 220000,
      });
      const receipt = await tx.wait();

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that make the transaction fail once it
        // was mined, so we throw this generic one.
        throw new Error("Transaction failed");
      }

    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      console.error(error);
      this.setState({ transactionError: error });
    }
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is Localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: 'Please connect Metamask to Localhost:8545'
    });

    return false;
  }
}
