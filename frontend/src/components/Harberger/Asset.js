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
      isLoadingToken: true,
      isLoadingMetadata: true
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
      const approvedAccount = await this.props.contract.getApproved(tokenId);
      const baseTaxValue = await this.props.contract.baseTaxValues(tokenId)
      const timeExpired = await this.props.contract.timeExpired(tokenId);
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
        creatorBalance: creatorBalance.toString(),
        ownerAddress: ethers.utils.getAddress(assetOwner),
        timeExpired: timeExpired,
        tokenURI: tokenURI,
        isLoadingToken: false
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

      this.setState({
        artistName: response.data.artist,
        creatorName: response.data.creator,
        tokenDescription: response.data.description,
        tokenMedia: response.data.image,
        tokenName: response.data.name,
        isLoadingMetadata: false
      })

      console.log("Harberger Metadata State:", this.state);
    } catch(err) {
      console.log(err);
    }
  }

  convertToEth = (value) => {
    if (!value) return
    return parseFloat(ethers.utils.formatEther(value)).toFixed(4)
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
        {!this.isLoadingToken && (
          <Container>
            <h1 className="text-center my-5">Harberger Taxes</h1>
            <Row>
              <Metadata
                artistName={this.state.artistName}
                artistWebsite={this.state.artistWebsite}
                assetForeclosure={this.state.assetForeclosure}
                assetPrice={this.state.assetPrice}
                assetTaxAmount={this.state.assetTaxAmount}
                contractAddress={this.props.contractAddress}
                convertToEth={this.convertToEth}
                creatorAddress={this.props.creatorAddress}
                creatorName={this.state.creatorName}
                isLoadingMetadata={this.props.isLoadingMetadata}
                minifyHash={this.props.minifyHash}
                timeExpired={this.state.timeExpired}
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
                creatorAddress={this.props.creatorAddress}
                reclaimAsset={this.props.reclaimAsset}
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
