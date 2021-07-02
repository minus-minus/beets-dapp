import React, { Component } from "react";
import { Col, Jumbotron, Accordion, Card, Badge } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";

const OPEN_SEA_BASE_URI = "https://opensea.io/";

class Metadata extends Component {
  constructor(props) {
    super(props)
    this.state = {
      timeExpired: this.props.timeExpired
    }

    this.timeRemaining = this.timeRemaining.bind(this)
  }

  componentDidMount() {
    this.timeRemaining(this.props.assetForeclosure)
    setInterval(() => this.timeRemaining(this.props.assetForeclosure), 100)
  }

  timeRemaining = (foreclosure) => {
    if (!foreclosure) return

    var current = Math.floor(Date.now() / 1000)
    var remaining = foreclosure - current
    var days = Math.floor(remaining / (3600 * 24))
    var hrs = Math.floor(remaining % (3600 * 24) / 3600)
    var mins = Math.floor(remaining % 3600 / 60)
    var secs = Math.floor(remaining % 60)

    if (current >= foreclosure) {
      this.setState({ timeExpired: true })
    } else {
      this.setState({ days, hrs, mins, secs })
    }
  }

  render() {
    const assetPrice = this.props.convertToEth(this.props.assetPrice)
    const assetTaxAmount = this.props.convertToEth(this.props.assetTaxAmount)
    const contractAddress = this.props.contractAddress
    const creatorAddress = this.props.creatorAddress
    const creatorName = this.props.creatorName
    const isLoadingMetadata = this.props.isLoadingMetadata
    const timeExpired = this.state.timeExpired
    const tokenMedia = this.props.tokenMedia
    const tokenId = this.props.tokenId

    return (
      <Col className="d-flex justify-content-center">
        <Jumbotron className="p-5 mb-5 mx-2">
          <div className="text-center mb-3">
            {!timeExpired ? (
              <b>{this.state.days} days, {this.state.hrs} hrs, {this.state.mins} mins, {this.state.secs} secs</b>
            ) : (
              <b>TIME EXPIRED</b>
            )}
          </div>
          {!isLoadingMetadata ? (
            <video
              className="asset-media mb-3"
              style={{border: "5px solid #808080"}}
              controls
              playsInline
              src={tokenMedia}
            />
          ) : (
            <img
              className="asset-media mb-3"
              src="/placeholder.jpeg"
              alt="placeholder"
            />
          )}
          <div className="asset-price">
            <Badge className="p-2 price">
              Price <b>Ξ {assetPrice}</b>
            </Badge>
            <Badge className="p-2 tax">
              Tax <b>Ξ {assetTaxAmount}</b>
            </Badge>
          </div>
          <Accordion className="text-center mt-4">
            <Card>
              <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                <b>Artist</b>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  <a href={OPEN_SEA_BASE_URI + creatorAddress} rel="noopener noreferrer" target="_blank">
                    {creatorName}
                  </a>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Accordion.Toggle as={Card.Header} variant="link" eventKey="1">
                <b>Asset</b>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  <a href={OPEN_SEA_BASE_URI + 'assets/' + contractAddress.toLowerCase() + '/' + tokenId} rel="noopener noreferrer" target="_blank">
                    {this.props.tokenName}
                  </a>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </Jumbotron>
      </Col>
    )
  }
};

export default Metadata;
