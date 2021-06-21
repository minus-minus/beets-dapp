import React, { Component } from "react";
import { ethers } from "ethers";
import Navigation from "./Navigation";
import Heading from "./Heading";
import AssetToken from "./AssetToken";
import AssetInfo from "./AssetInfo";
import AssetHistory from "./AssetHistory";
import AssetOwner from "./AssetOwner";
import BigNumber from "bignumber.js";
import { Container, Row } from "react-bootstrap";
import "../stylesheets/HarbergerAsset.css";

class HarbergerAsset extends Component {
  constructor(props) {
    super(props)

    this.minifyAddress = this.minifyAddress.bind(this)
    this.convertToEth = this.convertToEth.bind(this)
    this.convertToWei = this.convertToWei.bind(this)
  }

  minifyAddress = (address) => {
    if (!address) return
    const length = address.length
    return `${address.substring(0, 6)}...${address.substring(length-4, length)}`
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
        <Navigation
          minifyAddress={this.minifyAddress}
          selectedAddress={this.props.selectedAddress}
        />
        <Container className="mt-5">
          <Row>
            <Heading
              mintToken={this.props.mintToken}
              selectedAddress={this.props.selectedAddress}
              tokenURI={this.props.tokenURI}
            />
          </Row>
        </Container>
        {!this.props.isLoadingToken ? (
          <Container>
            <Row>
              <AssetToken
                assetDeadline={this.props.assetDeadline}
                assetPrice={this.props.assetPrice}
                assetTaxAmount={this.props.assetTaxAmount}
                convertToEth={this.convertToEth}
                creatorAddress={this.props.creatorAddress}
                minifyAddress={this.minifyAddress}
                ownerAddress={this.props.ownerAddress}
                timeExpired={this.props.timeExpired}
                tokenImage={this.props.tokenImage}
                tokenURI={this.props.tokenURI}
              />
              <AssetInfo
                assetPrice={this.props.assetPrice}
                buyAsset={this.props.buyAsset}
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
                eventLogs={this.props.eventLogs}
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
        ) : (
          null
        )}
      </div>
    )
  }
};

export default HarbergerAsset;
