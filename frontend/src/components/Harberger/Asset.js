import React, { Component } from "react";
import { ethers } from "ethers";
import Metadata from "./Metadata";
import Marketplace from "./Marketplace";
import Provenance from "./Provenance";
import Ownership from "./Ownership";
import Reference from "./Reference";
import BigNumber from "bignumber.js";
import { Container, Row } from "react-bootstrap";

const axios = require('axios');

class Asset extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loadingToken: true,
      loadingMetadata: true
    }

    this.apiRequest = this.apiRequest.bind(this)
    this.convertToEth = this.convertToEth.bind(this)
    this.convertToWei = this.convertToWei.bind(this)
    this.loadHarbergerToken = this.loadHarbergerToken.bind(this)
  }

  componentDidMount() {
    this.loadHarbergerToken();
  }

  async loadHarbergerToken() {
    try {
      const tokenId = this.props.tokenId
      const assetOwner = await this.props.contract.ownerOf(tokenId);
      // const ownerAddressENS = await this.props.provider.lookupAddress(assetOwner);
      const approvedAccount = await this.props.contract.getApproved(tokenId);
      const baseTaxValue = await this.props.contract.baseTaxValues(tokenId)
      const foreclosure = await this.props.contract.foreclosure(tokenId);
      const tokenURI = await this.props.contract.tokenURI(tokenId);
      const adminBalance = await this.props.contract.balances(tokenId, this.props.adminAddress);
      const creatorBalance = await this.props.contract.balances(tokenId, this.props.creatorAddress);

      this.setState({
        adminBalance: adminBalance.toString(),
        approvedAddress: ethers.utils.getAddress(approvedAccount),
        assetForeclosure: this.props.asset.foreclosureTimestamp.toString(),
        assetLastDeposit: this.props.asset.lastDepositTimestamp.toString(),
        assetPrice: this.props.asset.priceAmount.toString(),
        assetTaxAmount: this.props.asset.taxAmount.toString(),
        assetTotalDeposit: this.props.asset.totalDepositAmount.toString(),
        baseTaxValue: baseTaxValue.toString(),
        creatorAddress: this.props.creatorAddress,
        creatorBalance: creatorBalance.toString(),
        ownerAddress: ethers.utils.getAddress(assetOwner),
        foreclosure: foreclosure,
        tokenURI: tokenURI,
        loadingToken: false
      })

      console.log("Harberger Token State:", this.state);
      this.apiRequest();
    } catch(err) {
      console.log(err);
    }
  }

  async apiRequest() {
    try {
      const tokenURI = this.state.tokenURI;
      const response = await axios.get(tokenURI);
      const data = response.data

      this.setState({
        artistName: data.artist,
        creatorName: data.creator,
        tokenDescription: data.description,
        tokenMedia: data.image,
        tokenName: data.name,
        loadingMetadata: false
      })

      console.log("Harberger Metadata State:", this.state);
    } catch(err) {
      console.log(err);
    }
  }

  convertToEth = (value, decimals = 4) => {
    if (!value) return
    return parseFloat(ethers.utils.formatEther(value)).toFixed(decimals)
  }

  convertToWei = (value) => {
    if (!value) return
    const priceEth = value.toString().split('Ξ ')[1]
    const priceWei = ethers.utils.parseUnits(priceEth, 'ether')
    return BigNumber(priceWei.toString()).toFixed()
  }

  render() {
    return (
      <div>
        {!this.loadingToken && (
          <Container>
            <h1 className="text-center my-5">Beets Market</h1>
            <Row>
              <Metadata
                artistName={this.state.artistName}
                artistWebsite={this.state.artistWebsite}
                assetForeclosure={this.state.assetForeclosure}
                assetPrice={this.state.assetPrice}
                assetTaxAmount={this.state.assetTaxAmount}
                contractAddress={this.props.contractAddress}
                convertToEth={this.convertToEth}
                creatorAddress={this.state.creatorAddress}
                creatorName={this.state.creatorName}
                foreclosure={this.state.foreclosure}
                loadingMetadata={this.props.loadingMetadata}
                minifyHash={this.props.minifyHash}
                tokenId={this.props.tokenId}
                tokenMedia={this.state.tokenMedia}
                tokenName={this.state.tokenName}
                tokenURI={this.state.tokenURI}
              />
              <Marketplace
                approvedAddress={this.state.approvedAddress}
                assetForeclosure={this.state.assetForeclosure}
                assetPrice={this.state.assetPrice}
                assetTaxAmount={this.state.assetTaxAmount}
                assetTotalDeposit={this.state.assetTotalDeposit}
                baseInterval={this.props.baseInterval}
                baseTaxValue={this.state.baseTaxValue}
                buyAsset={this.props.buyAsset}
                contractAddress={this.props.contractAddress}
                convertToEth={this.convertToEth}
                convertToWei={this.convertToWei}
                depositTax={this.props.depositTax}
                listAsset={this.props.listAsset}
                minifyHash={this.props.minifyHash}
                ownerAddress={this.state.ownerAddress}
                selectedAddress={this.props.selectedAddress}
                selectedBalance={this.props.selectedBalance}
                setApproval={this.props.setApproval}
                taxRatePercentage={this.props.taxRatePercentage}
                tokenDescription={this.state.tokenDescription}
                tokenId={this.props.tokenId}
              />
            </Row>
            <Row>
              <Provenance
                convertToEth={this.convertToEth}
                eventLogs={this.props.eventLogs}
                minifyHash={this.props.minifyHash}
                tokenId={this.props.tokenId}
              />
            </Row>
            <Row>
              <Ownership
                adminAddress={this.props.adminAddress}
                collectFunds={this.props.collectFunds}
                creatorAddress={this.state.creatorAddress}
                reclaimAsset={this.props.reclaimAsset}
                provider={this.props.provider}
                selectedAddress={this.props.selectedAddress}
                tokenId={this.props.tokenId}
              />
            </Row>
            <Reference/>
          </Container>
        )}
      </div>
    )
  }
};

export default Asset;
