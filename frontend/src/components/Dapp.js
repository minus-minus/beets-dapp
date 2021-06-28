import React from "react";
import { ethers } from "ethers";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// CONTRACTS
import contractAddress from "../contracts/contract-address.json";
import HTAX_ARTIFACT from "../contracts/HarbergerAsset.json";
import { HTAX_EVENT_ABI } from "../utils/HTAX/constants";
import { ENIGMA_ABI } from "../utils/EB/EulerBeatsAbi";
import { ENIGMA_TOKEN_CONTRACT_ADDRESS } from "../utils/EB/constants";
// COMPONENTS
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { PrintList } from './EulerBeat/PrintList';
import Navigation from "./Navigation";
import MintToken from "./Harberger/MintToken";
import Asset from "./Harberger/Asset";
import Footer from "./Footer";
// import { Transfer } from "./Transfer";
// import { TransactionErrorMessage } from "./TransactionErrorMessage";
// import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
// import { NoTokensMessage } from "./NoTokensMessage";

// CONSTANTS
const HARDHAT_NETWORK_ID = '1337';
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;
const originalOwner = "0xf47f5A7F2917800149f638E9f0eD3745D16481C6";

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      assets: [],
      networkError: undefined,
      selectedAddress: undefined,
      transactionError: undefined,
      isLoadingContract: true
    };

    this.loadHarbergerContract = this.loadHarbergerContract.bind(this)
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
    // console.log(this.state)

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

    // // If the token data or the user's balance hasn't loaded yet, we show
    // // a loading component.
    if (this.state.isLoadingWallet) {
      return <Loading />;
    }

    // If everything is loaded, we render the application.
    return (
      <Router>
        <Navigation
          connectWallet={() => this._connectWallet()}
          minifyHash={this._minifyHash}
          selectedAddress={this.state.selectedAddress}
        />
        <div id="dapp">
          <Switch>
            <Route path="/euler-beats">
              <PrintList
                mintPrint={(originalTokenId, price) => this.mintPrint(originalTokenId, price)}
                getTrackSupply={(originalTokenId) => this.getTrackSupply(originalTokenId)}
                getTrackPrice={(printSupply) => this.getTrackPrice(printSupply)}
              />
            </Route>
            {(!this.state.assets.length) && (
              <Route path={"/harberger-taxes"}>
                <MintToken
                  adminAddress={this.state.adminAddress}
                  mintToken={this.mintToken}
                  selectedAddress={this.state.selectedAddress}
                />
              </Route>
            )}
            {this.state.assets.map((asset, index) => {
              return (
                <Route path={"/harberger-taxes/asset/" + asset.tokenId} key={index}>
                  <Asset
                    // Contract and Asset Data
                    asset={asset}
                    adminAddress={this.state.adminAddress}
                    baseInterval={this.state.baseInterval}
                    baseTaxPrice={this.state.baseTaxPrice}
                    contractAddress={this.state.contractAddress}
                    creatorAddress={ethers.utils.getAddress(asset.creator)}
                    contract={this.HTAXcontract}
                    eventLogs={this.state.eventLogs}
                    isLoadingContract={this.state.isLoadingContract}
                    selectedAddress={this.state.selectedAddress}
                    taxRatePercentage={this.state.taxRatePercentage}
                    tokenId={asset.tokenId}
                    // Functions
                    buyAsset={this.buyAsset}
                    collectFunds={this.collectFunds}
                    depositTax={this.depositTax}
                    listAsset={this.listAsset}
                    minifyHash={this._minifyHash}
                    reclaimAsset={this.reclaimAsset}
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

  // This method is run when the user clicks the Connect. It connects the
  // dapp to the user's wallet, and initializes it.
  async _connectWallet() {
    this.setState({isLoadingWallet: true})
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

    setTimeout(() => this.setState({ isLoadingWallet: false }), 2000)
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
    this._intializeEthers();

    this.loadHarbergerContract();
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

  async loadHarbergerContract() {
    const contractAdmin = await this.HTAXcontract.admin();
    const contractBalance = await this._provider.getBalance(contractAddress.HarbergerAsset);
    const assets = await this.HTAXcontract.fetchAssets();
    const taxRatePercentage = await this.HTAXcontract.taxPercentage();
    const baseInterval = await this.HTAXcontract.baseInterval();
    const baseTaxPrice = await this.HTAXcontract.baseTaxPrice();
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
      baseTaxPrice: baseTaxPrice.toString(),
      network: network,
      taxRatePercentage: taxRatePercentage.toString(),
      isLoadingContract: false
    })

    console.log("Harberger Contract State:", this.state);
  }

  async mintToken(creatorAddress, ipfsHash) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

    try {
      const transaction = await contract.mintToken(creatorAddress, ipfsHash);
      const receipt = await transaction.wait();

      console.clear();
      console.log("MintToken Transaction Receipt:", receipt);
      this._connectWallet();
    } catch(err) {
      console.log("MintToken Error");
      alert(this._getRpcErrorMessage(err));
    }
  }

  async listAsset(tokenId, amount, approvedAddress) {
    if (approvedAddress !== this.state.contractAddress) {
      this.setApproval(tokenId);
      // await this.setApproval();
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

    try {
      const transaction = await contract.listAssetForSaleInWei(tokenId, amount);
      const receipt = await transaction.wait();

      console.clear();
      console.log("ListAsset Transaction Receipt:", receipt);
      this._connectWallet();
    } catch(err) {
      console.log("ListAsset Error");
      alert(this._getRpcErrorMessage(err));
    }
  }

  async depositTax(tokenId, amount, approvedAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

    try {
      const transaction = await contract.depositTaxInWei(tokenId, { value: amount });
      const receipt = await transaction.wait();

      console.clear();
      console.log("DepositTax Transaction Receipt:", receipt);
      this._connectWallet();
    } catch(err) {
      console.log("DepositTax Error");
      alert(this._getRpcErrorMessage(err));
    }
  }

  async setApproval(tokenId) {
    console.log(tokenId)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

    try {
      const transaction = await contract.approve(contractAddress.HarbergerAsset, tokenId);
      const receipt = await transaction.wait();

      console.clear();
      console.log("SetApproval Transaction Receipt:", receipt);
      this._connectWallet();
    } catch(err) {
      console.log("SetApproval Error");
      alert(this._getRpcErrorMessage(err));
    }
  }

  async buyAsset(tokenId, assetPrice) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

    try {
      const transaction = await contract.buyAssetInWei(tokenId, { value: assetPrice });
      const receipt = await transaction.wait();

      console.clear();
      console.log("BuyAsset Transaction Receipt:", receipt);
      this._connectWallet();
    } catch(err) {
      console.log("BuyAsset Error");
      alert(this._getRpcErrorMessage(err));
    }
  }

  async collectFunds(tokenId) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

    try {
      const transaction = await contract.collectFunds(tokenId);
      const receipt = await transaction.wait();

      console.clear();
      console.log("CollectFunds Transaction Receipt:", receipt);
      this._connectWallet();
    } catch(err) {
      console.log("CollectFunds Error");
      alert(this._getRpcErrorMessage(err));
    }
  }

  async reclaimAsset(tokenId) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress.HarbergerAsset, HTAX_ARTIFACT.abi, provider.getSigner());

    try {
      const transaction = await contract.reclaimAsset(tokenId);
      const receipt = await transaction.wait();

      console.clear();
      console.log("Transaction Receipt:", receipt);
      this._connectWallet();
    } catch(err) {
      console.log("ReclaimAsset Error");
      alert(this._getRpcErrorMessage(err));
    }
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

  _minifyHash(address) {
    if (!address) return

    const hashStart = address.substring(0, 6)
    const hashEnd = address.substring(address.length-4, address.length)

    return `${hashStart}...${hashEnd}`
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    console.clear();

    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: 'Please connect Metamask to localhost:8545'
    });

    return false;
  }
}
