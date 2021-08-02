import React from "react";
import { ethers } from "ethers";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// COMPONENTS
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { NetworkError } from "./NetworkError";
import { TransactionError } from "./TransactionError";
import { TransactionPending } from "./TransactionPending";
import { TransactionSuccess } from "./TransactionSuccess";
import { PrintList } from './EulerBeat/PrintList';
import Navigation from "./Navigation";
import MintAsset from "./Harberger/MintAsset";
import Inventory from "./Harberger/Inventory";
import Asset from "./Harberger/Asset";
import Footer from "./Footer";
// CONTRACTS
import contractAddress from "../contracts/contract-address.json";
import { ENIGMA_ABI } from "../utils/EB/EulerBeatsAbi";
import { ENIGMA_TOKEN_CONTRACT_ADDRESS, ORIGINAL_OWNER } from "../utils/EB/constants";
import { HTAX_EVENT_ABI } from "../utils/HTAX/constants";
import HTAX_ARTIFACT from "../contracts/HarbergerAsset.json";
// STYLESHEETS
import "../stylesheets/Dapp.css";
// NETWORKS
// const MAINNET_NETWORK_ID = '1';
const RINKEBY_NETWORK_ID = '4';
// const HARDHAT_NETWORK_ID = '1337';

export class Dapp extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = {
      assets: [],
      loadingContract: true,
      networkError: undefined,
      selectedAddress: undefined,
      transactionError: undefined,
      transactionPending: undefined,
      transactionSuccess: undefined
    };

    this.loadHarbergerContract = this.loadHarbergerContract.bind(this);
    this.getHarbergerContract = this.getHarbergerContract.bind(this);
    this.mintAsset = this.mintAsset.bind(this);
    this.setApproval = this.setApproval.bind(this);
    this.listAsset = this.listAsset.bind(this);
    this.depositTax = this.depositTax.bind(this);
    this.buyAsset = this.buyAsset.bind(this);
    this.collectFunds = this.collectFunds.bind(this);
    this.reclaimAsset = this.reclaimAsset.bind(this);

    this.state = this.initialState;
  }

  // This method is run when the user clicks the Connect. It connects the
  // dapp to the user's wallet, and initializes it.
  async _connectWallet() {
    console.clear();
    this.setState({ loadingWallet: true })
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

    this._dismissNetworkError();

    setTimeout(() => this.setState({ loadingWallet: false }), 2000);
  }

  _resetState() {
    console.clear();
    this.setState(this.initialState);
  }

  _checkNetwork() {
    if (window.ethereum.networkVersion === RINKEBY_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: 'Please connect MetaMask to Rinkeby Testnet'
    });

    return false;
  }

  // This method initializes the dapp
  _initialize(userAddress) {
    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: ethers.utils.getAddress(userAddress)
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._initializeEthers();

    this.loadHarbergerContract();
  }

  async _initializeEthers() {
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

  async getTrackSupply(originalTokenId) {
    // console.log("contractInstance", this.EBcontract);
    return await this.EBcontract.seedToPrintsSupply(originalTokenId);
  }

  async getTrackPrice(supplyCount) {
    // console.log("contractInstance", this.EBcontract);
    return await this.EBcontract.getPrintPrice(supplyCount);
  }

  async mintPrint(originalTokenId, price) {
    // console.log("contractInstance", this.EBcontract);
    try {
      const transaction = await this.EBcontract.mintPrint(originalTokenId, ORIGINAL_OWNER, { value: price });
      this._connectWallet();
      this.setState({
        transactionPending: true,
        transactionHash: transaction.hash,
        transactionSuccess: undefined,
        transactionError: undefined
      });

      const receipt = await transaction.wait();
      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that make the transaction fail once it
        // was mined, so we throw this generic one.
        throw new Error("Transaction Failed");
      }

      this._connectWallet();
      this.setState({
        transactionError: undefined,
        transactionPending: undefined,
        transactionSuccess: "Mint Print"
      });

    } catch (error) {
      this._connectWallet();
      this.setState({
        transactionPending: undefined,
        transactionSuccess: undefined,
        transactionError: this._getRpcErrorMessage(error)
      });
    }
  }

  async loadHarbergerContract() {
    const contractAdmin = await this.HTAXcontract.admin();
    const contractBalance = await this._provider.getBalance(contractAddress.HarbergerAsset);
    const selectedBalance = await this._provider.getBalance(this.state.selectedAddress);
    const assets = await this.HTAXcontract.fetchAssets();
    const taxRatePercentage = await this.HTAXcontract.taxRatePercentage();
    const baseInterval = await this.HTAXcontract.baseInterval();
    const network = await this._provider.getNetwork();
    const logs = await this._provider.getLogs({ address: contractAddress.HarbergerAsset, fromBlock: 0 });
    const iface = new ethers.utils.Interface(HTAX_EVENT_ABI);

    this.setState({ eventLogs: [] })
    logs.map(async (log, i) => {
      this.state.eventLogs.push(iface.parseLog(log));
    })

    this.setState({
      adminAddress: ethers.utils.getAddress(contractAdmin),
      assets: assets,
      contractAddress: ethers.utils.getAddress(contractAddress.HarbergerAsset),
      contractBalance: contractBalance.toString(),
      baseInterval: baseInterval.toString(),
      network: network,
      selectedBalance: selectedBalance,
      taxRatePercentage: taxRatePercentage.toString(),
      loadingContract: false
    })

    console.log("Harberger Contract State:", this.state);
  }

  async getHarbergerContract() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());
  }

  async mintAsset(arweaveId, ipfsHash, creatorAddress) {
    const contract = await this.getHarbergerContract();

    try {
      const transaction = await contract.mintAsset(arweaveId, ipfsHash, creatorAddress);
      this._connectWallet();
      this.setState({
        transactionPending: true,
        transactionHash: transaction.hash,
        transactionSuccess: undefined,
        transactionError: undefined
      });

      await transaction.wait();
      this._connectWallet();
      this.setState({
        transactionError: undefined,
        transactionPending: undefined,
        transactionSuccess: "Mint Asset"
      });

    } catch(err) {
      this._connectWallet();
      this.setState({
        transactionPending: undefined,
        transactionSuccess: undefined,
        transactionError: this._getRpcErrorMessage(err)
      });
    }
  }

  async setApproval(tokenId) {
    const contract = await this.getHarbergerContract();

    try {
      const transaction = await contract.approve(contractAddress.HarbergerAsset, tokenId);
      this._connectWallet();
      this.setState({
        transactionPending: true,
        transactionHash: transaction.hash,
        transactionSuccess: undefined,
        transactionError: undefined
      });

      await transaction.wait();
      this._connectWallet();
      this.setState({
        transactionError: undefined,
        transactionPending: undefined,
        transactionSuccess: "Approve Contract"
      });

    } catch(err) {
      this._connectWallet();
      this.setState({
        transactionPending: undefined,
        transactionSuccess: undefined,
        transactionError: this._getRpcErrorMessage(err)
      });
    }
  }

  async listAsset(tokenId, amount, approvedAddress) {
    if (approvedAddress === this.state.contractAddress) {
      const contract = await this.getHarbergerContract();

      try {
        const transaction = await contract.listAssetForSaleInWei(tokenId, amount);
        this._connectWallet();
        this.setState({
          transactionPending: true,
          transactionHash: transaction.hash,
          transactionSuccess: undefined,
          transactionError: undefined
        });

        await transaction.wait();
        this._connectWallet();
        this.setState({
          transactionError: undefined,
          transactionPending: undefined,
          transactionSuccess: "List Asset"
        });

      } catch(err) {
        this._connectWallet();
        this.setState({
          transactionPending: undefined,
          transactionSuccess: undefined,
          transactionError: this._getRpcErrorMessage(err)
        });
      }
    }
  }

  async depositTax(tokenId, amount, approvedAddress) {
    const contract = await this.getHarbergerContract();

    try {
      const transaction = await contract.depositTaxInWei(tokenId, { value: amount });
      this._connectWallet();
      this.setState({
        transactionPending: true,
        transactionHash: transaction.hash,
        transactionSuccess: undefined,
        transactionError: undefined
      });

      await transaction.wait();
      this._connectWallet();
      this.setState({
        transactionError: undefined,
        transactionPending: undefined,
        transactionSuccess: "Deposit Taxes"
      });

    } catch(err) {
      this._connectWallet();
      this.setState({
        transactionPending: undefined,
        transactionSuccess: undefined,
        transactionError: this._getRpcErrorMessage(err)
      });
    }
  }

  async buyAsset(tokenId, assetPrice) {
    const contract = await this.getHarbergerContract();

    try {
      const transaction = await contract.buyAssetInWei(tokenId, { value: assetPrice });
      this._connectWallet();
      this.setState({
        transactionPending: true,
        transactionHash: transaction.hash,
        transactionSuccess: undefined,
        transactionError: undefined
      });

      await transaction.wait();
      this._connectWallet();
      this.setState({
        transactionError: undefined,
        transactionPending: undefined,
        transactionSuccess: "Purchase Asset"
      });

    } catch(err) {
      this._connectWallet();
      this.setState({
        transactionPending: undefined,
        transactionSuccess: undefined,
        transactionError: this._getRpcErrorMessage(err)
      });
    }
  }

  async collectFunds(tokenId) {
    const contract = await this.getHarbergerContract();

    try {
      const transaction = await contract.collectFunds(tokenId);
      this._connectWallet();
      this.setState({
        transactionPending: true,
        transactionHash: transaction.hash,
        transactionSuccess: undefined,
        transactionError: undefined
      });

      await transaction.wait();
      this._connectWallet();
      this.setState({
        transactionError: undefined,
        transactionPending: undefined,
        transactionSuccess: "Collect Funds"
      });

    } catch(err) {
      this._connectWallet();
      this.setState({
        transactionPending: undefined,
        transactionSuccess: undefined,
        transactionError: this._getRpcErrorMessage(err)
      });
    }
  }

  async reclaimAsset(tokenId) {
    const contract = await this.getHarbergerContract();

    try {
      const transaction = await contract.reclaimAsset(tokenId);
      this._connectWallet();
      this.setState({
        transactionPending: true,
        transactionHash: transaction.hash,
        transactionSuccess: undefined,
        transactionError: undefined
      });

      await transaction.wait();
      this._connectWallet();
      this.setState({
        transactionError: undefined,
        transactionPending: undefined,
        transactionSuccess: "Reclaim Asset"
      });

    } catch(err) {
      this._connectWallet();
      this.setState({
        transactionPending: undefined,
        transactionSuccess: undefined,
        transactionError: this._getRpcErrorMessage(err)
      });
    }
  }

  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  _dismissTransactionPending() {
    this.setState({ transactionPending: undefined });
  }

  _dismissTransactionSuccess() {
    this.setState({ transactionSuccess: undefined });
  }

  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message.split("'")[1]
    }

    if (error.message.includes("reverted")) {
      return error.message.split(',"data"')[0].split("reverted:")[1].slice(0, -1)
    }

    return error.message
  }

  _minifyHash(address) {
    if (!address) return
    const hashStart = address.substring(0, 6)
    const hashEnd = address.substring(address.length-4, address.length)

    return `${hashStart}...${hashEnd}`
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
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          dismiss={() => this._dismissNetworkError()}
          networkError={this.state.networkError}
        />
      );
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    if (this.state.loadingWallet) {
      return <Loading />;
    }

    return (
      <Router>
        <Navigation
          connectWallet={() => this._connectWallet()}
          minifyHash={this._minifyHash}
          selectedAddress={this.state.selectedAddress}
        />
        {this.state.networkError && (
          <NetworkError
            dismiss={() => this._dismissNetworkError()}
            message={this.state.networkError}
          />
        )}
        {this.state.transactionPending && (
          <TransactionPending
            dismiss={() => this._dismissTransactionPending()}
            minifyHash={this._minifyHash}
            transactionHash={this.state.transactionHash}
          />
        )}
        {this.state.transactionSuccess && (
          <TransactionSuccess
            dismiss={() => this._dismissTransactionSuccess()}
            message={this.state.transactionSuccess}
            transactionHash={this.state.transactionHash}
          />
        )}
        {this.state.transactionError && (
          <TransactionError
            dismiss={() => this._dismissTransactionError()}
            message={this.state.transactionError}
          />
        )}
        <div id="dapp">
          <Switch>
            <Route exact path="/">
              <img
                className="header"
                src="/header.png"
                alt="BeetsDAO"
              />
            </Route>
            <Route path="/euler-beats/prints">
              <PrintList
                mintPrint={(originalTokenId, price) => this.mintPrint(originalTokenId, price)}
                getTrackSupply={(originalTokenId) => this.getTrackSupply(originalTokenId)}
                getTrackPrice={(printSupply) => this.getTrackPrice(printSupply)}
              />
            </Route>
            <Route exact path={"/harberger-taxes/assets"}>
              {this.state.selectedAddress === this.state.adminAddress && (
                <MintAsset
                  adminAddress={this.state.adminAddress}
                  mintAsset={this.mintAsset}
                  selectedAddress={this.state.selectedAddress}
                />
              )}
              <Inventory
                assets={this.state.assets}
                contract={this.HTAXcontract}
              />
            </Route>
            {this.state.assets.map((asset, index) => {
              return (
                <Route path={"/harberger-taxes/asset/" + asset.tokenId} key={index}>
                  <Asset
                    // Contract and Asset Data
                    asset={asset}
                    adminAddress={this.state.adminAddress}
                    baseInterval={this.state.baseInterval}
                    contractAddress={this.state.contractAddress}
                    creatorAddress={ethers.utils.getAddress(asset.creator)}
                    contract={this.HTAXcontract}
                    eventLogs={this.state.eventLogs}
                    loadingContract={this.state.loadingContract}
                    provider={this._provider}
                    selectedAddress={this.state.selectedAddress}
                    selectedBalance={this.state.selectedBalance}
                    taxRatePercentage={this.state.taxRatePercentage}
                    tokenId={asset.tokenId}
                    // Functions
                    buyAsset={this.buyAsset}
                    collectFunds={this.collectFunds}
                    depositTax={this.depositTax}
                    listAsset={this.listAsset}
                    minifyHash={this._minifyHash}
                    reclaimAsset={this.reclaimAsset}
                    setApproval={this.setApproval}
                  />
                </Route>
              )
            })}
          </Switch>
        </div>
        <Footer/>
      </Router>
    )
  }
}
