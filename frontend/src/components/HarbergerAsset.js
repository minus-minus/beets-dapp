import React, { Component } from "react";
import { ethers } from "ethers";
import AssetToken from "./Harberger/AssetToken";
import AssetInfo from "./Harberger/AssetInfo";
import AssetHistory from "./Harberger/AssetHistory";
import AssetOwner from "./Harberger/AssetOwner";
import BigNumber from "bignumber.js";
import { Container, Row } from "react-bootstrap";

const axios = require('axios');

class HarbergerAsset extends Component {
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
      const assetOwner = await this.props.contract.ownerOf(this.props.tokenId);
      const approvedAccount = await this.props.contract.getApproved(this.props.tokenId);
      const timeExpired = await this.props.contract.timeExpired(this.props.tokenId);
      const tokenURI = await this.props.contract.tokenURI(this.props.tokenId);
      const adminBalance = await this.props.contract.balances(this.props.tokenId, this.props.adminAddress);
      const creatorBalance = await this.props.contract.balances(this.props.tokenId, this.props.creatorAddress);

      this.setState({
        adminBalance: adminBalance.toString(),
        approvedAddress: ethers.utils.getAddress(approvedAccount),
        assetDeadline: this.props.asset.deadline.toString(),
        assetLastDeposit: this.props.asset.lastDeposit.toString(),
        assetPrice: this.props.asset.price.toString(),
        assetTaxAmount: this.props.asset.taxAmount.toString(),
        assetTotalDeposit: this.props.asset.totalDeposit.toString(),
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
        artistWebsite: response.data.website,
        creatorName: response.data.creator,
        tokenDescription: response.data.description,
        tokenImage: response.data.image,
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
              <AssetToken
                artistName={this.state.artistName}
                artistWebsite={this.state.artistWebsite}
                assetDeadline={this.state.assetDeadline}
                assetPrice={this.state.assetPrice}
                assetTaxAmount={this.state.assetTaxAmount}
                contractAddress={this.props.contractAddress}
                convertToEth={this.convertToEth}
                creatorAddress={this.props.creatorAddress}
                creatorName={this.state.creatorName}
                isLoadingMetadata={this.props.isLoadingMetadata}
                minifyHash={this.props.minifyHash}
                ownerAddress={this.state.ownerAddress}
                timeExpired={this.state.timeExpired}
                tokenId={this.props.tokenId}
                tokenImage={this.state.tokenImage}
                tokenName={this.state.tokenName}
                tokenURI={this.state.tokenURI}
              />
              <AssetInfo
                approvedAddress={this.state.approvedAddress}
                assetDeadline={this.state.assetDeadline}
                assetPrice={this.state.assetPrice}
                assetTaxAmount={this.state.assetTaxAmount}
                baseInterval={this.props.baseInterval}
                baseTaxPrice={this.props.baseTaxPrice}
                buyAsset={this.props.buyAsset}
                contractAddress={this.props.contractAddress}
                convertToEth={this.convertToEth}
                convertToWei={this.convertToWei}
                depositTax={this.props.depositTax}
                listAsset={this.props.listAsset}
                ownerAddress={this.state.ownerAddress}
                selectedAddress={this.props.selectedAddress}
                taxRatePercentage={this.props.taxRatePercentage}
                tokenDescription={this.state.tokenDescription}
                tokenId={this.props.tokenId}
              />
            </Row>
            <Row>
              <AssetHistory
                convertToEth={this.convertToEth}
                eventLogs={this.props.eventLogs}
                minifyHash={this.props.minifyHash}
                tokenId={this.props.tokenId}
              />
            </Row>
            <Row>
              <AssetOwner
                adminAddress={this.props.adminAddress}
                collectFunds={this.props.collectFunds}
                creatorAddress={this.props.creatorAddress}
                reclaimAsset={this.props.reclaimAsset}
                selectedAddress={this.props.selectedAddress}
                tokenId={this.props.tokenId}
              />
            </Row>
          </Container>
        )}
      </div>
    )
  }
};

export default HarbergerAsset;
