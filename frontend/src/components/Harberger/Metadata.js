import React, { Component } from "react";
import { Col, Jumbotron, Accordion, Card, Badge } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";

const OPEN_SEA_BASE_URI = "https://testnets.opensea.io/";

class Metadata extends Component {
  constructor(props) {
    super(props)
    this.state = {
      foreclosure: this.props.foreclosure
    }

    this.timeRemaining = this.timeRemaining.bind(this)
  }

  componentDidMount() {
    this.timeRemaining(this.props.assetForeclosure)
    setInterval(() => this.timeRemaining(this.props.assetForeclosure), 100)
  }

  timeRemaining = (timestamp) => {
    if (!timestamp) return

    var current = Math.floor(Date.now() / 1000)
    var remaining = timestamp - current
    var days = Math.floor(remaining / (3600 * 24))
    var hrs = Math.floor(remaining % (3600 * 24) / 3600)
    var mins = Math.floor(remaining % 3600 / 60)
    var secs = Math.floor(remaining % 60)

    if (current >= timestamp) {
      this.setState({ foreclosure: true })
    } else {
      this.setState({ days, hrs, mins, secs })
    }
  }

  render() {
    const assetPrice = this.props.convertToEth(this.props.assetPrice, 2)
    const assetTaxAmount = this.props.convertToEth(this.props.assetTaxAmount, 2)
    const contractAddress = this.props.contractAddress
    const creatorAddress = this.props.creatorAddress
    const creatorName = this.props.creatorName
    const foreclosure = this.state.foreclosure
    const loadingMetadata = this.props.loadingMetadata
    const tokenMedia = this.props.tokenMedia
    const tokenId = this.props.tokenId

    return (
      <Col className="d-flex justify-content-center">
        <Jumbotron className="mb-5 mx-2 p-5">
          <div className="text-center mb-4">
            <h4 className="asset-name">
              <a
                href={OPEN_SEA_BASE_URI + 'assets/' + contractAddress.toLowerCase() + '/' + tokenId}
                rel="noopener noreferrer"
                target="_blank">
                {this.props.tokenName}
              </a>
            </h4>
          </div>
          {!loadingMetadata ? (
            <video
              className="asset-media mb-3"
              style={{ border: "5px solid #ACB2B5" }}
              poster="/assets/tokens/thumbnail.png"
              src={tokenMedia}
              controls
              playsInline
            />
          ) : (
            <img
              className="asset-media mb-3"
              src="/logos/blue.png"
              alt="placeholder"
            />
          )}
          <div className="asset-price">
            <Badge
              className="p-2 price"
              title={'Ξ ' + this.props.convertToEth(this.props.assetPrice)}
            >
              Price <b>Ξ {assetPrice}</b>
            </Badge>
            <Badge
              className="p-2 tax"
              title={'Ξ ' + this.props.convertToEth(this.props.assetTaxAmount)}
            >
              Tax <b>Ξ {assetTaxAmount}</b>
            </Badge>
          </div>
          <div className="asset-creator">
            <Badge
              className="p-2 creator"
              title={creatorName}
            >
              <a
                href={OPEN_SEA_BASE_URI + 'accounts/' + creatorAddress}
                rel="noopener noreferrer"
                target="_blank">
                Created by {creatorName}
              </a>
            </Badge>
          </div>
          <Accordion className="text-center mt-4">
            <Card>
              <Accordion as={Card.Header}>
                <b>Asset Foreclosure</b>
              </Accordion>
              <Accordion>
                <Card.Body>
                  {!foreclosure ? (
                    <b className="time-remaining">
                      {this.state.days} days, {this.state.hrs} hrs, {this.state.mins} mins, {this.state.secs} secs
                    </b>
                  ) : (
                    <b className="time-expired">
                      TIME EXPIRED
                    </b>
                  )}
                </Card.Body>
              </Accordion>
            </Card>
          </Accordion>
        </Jumbotron>
      </Col>
    )
  }
};

export default Metadata;
