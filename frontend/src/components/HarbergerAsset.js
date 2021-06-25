import React, { Component } from "react";
import { ethers } from "ethers";
import AssetHeader from "./Harberger/AssetHeader";
import AssetToken from "./Harberger/AssetToken";
import AssetInfo from "./Harberger/AssetInfo";
import AssetHistory from "./Harberger/AssetHistory";
import AssetOwner from "./Harberger/AssetOwner";
import BigNumber from "bignumber.js";
import { Container, Row } from "react-bootstrap";

class HarbergerAsset extends Component {
  constructor(props) {
    super(props)

    this.convertToEth = this.convertToEth.bind(this)
    this.convertToWei = this.convertToWei.bind(this)
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
        <AssetHeader
          mintToken={this.props.mintToken}
          selectedAddress={this.props.selectedAddress}
          tokenURI={this.props.tokenURI}
        />
        {!this.props.isLoadingToken && (
          <Container>
            <Row>
              <AssetToken
                assetDeadline={this.props.assetDeadline}
                assetPrice={this.props.assetPrice}
                assetTaxAmount={this.props.assetTaxAmount}
                convertToEth={this.convertToEth}
                creatorAddress={this.props.creatorAddress}
                isLoadingMetadata={this.props.isLoadingMetadata}
                minifyHash={this.props.minifyHash}
                ownerAddress={this.props.ownerAddress}
                timeExpired={this.props.timeExpired}
                tokenImage={this.props.tokenImage}
                tokenURI={this.props.tokenURI}
              />
              <AssetInfo
                approvedAddress={this.props.approvedAddress}
                assetDeadline={this.props.assetDeadline}
                assetPrice={this.props.assetPrice}
                assetTaxAmount={this.props.assetTaxAmount}
                baseInterval={this.props.baseInterval}
                baseTaxPrice={this.props.baseTaxPrice}
                buyAsset={this.props.buyAsset}
                contractAddress={this.props.contractAddress}
                convertToEth={this.convertToEth}
                convertToWei={this.convertToWei}
                depositTax={this.props.depositTax}
                listAsset={this.props.listAsset}
                ownerAddress={this.props.ownerAddress}
                selectedAddress={this.props.selectedAddress}
                taxRatePercentage={this.props.taxRatePercentage}
              />
            </Row>
            <Row>
              <AssetHistory
                convertToEth={this.convertToEth}
                eventLogs={this.props.eventLogs}
                minifyHash={this.props.minifyHash}
              />
            </Row>
            <Row>
              <AssetOwner
                adminAddress={this.props.adminAddress}
                collectFunds={this.props.collectFunds}
                creatorAddress={this.props.creatorAddress}
                reclaimAsset={this.props.reclaimAsset}
                selectedAddress={this.props.selectedAddress}
              />
            </Row>
          </Container>
        )}
      </div>
    )
  }
};

export default HarbergerAsset;
