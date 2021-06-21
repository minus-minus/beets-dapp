import React, { Component } from "react";
import { Col, Jumbotron, Accordion, Card, Badge } from "react-bootstrap";
import "../stylesheets/HarbergerAsset.css";

class AssetToken extends Component {
  constructor(props) {
    super(props)
    this.state = {
      timeExpired: this.props.timeExpired
    }

    this.timeRemaining = this.timeRemaining.bind(this)
  }

  componentDidMount() {
    this.timeRemaining(this.props.assetDeadline)
    setInterval(() => this.timeRemaining(this.props.assetDeadline), 100)
  }

  timeRemaining = (unixTime) => {
    if (!unixTime) return

    var current = Math.round((new Date()).getTime() / 1000)
    var remaining = unixTime - current
    var days = Math.floor(remaining / (3600 * 24))
    var hrs = Math.floor(remaining % (3600 * 24) / 3600)
    var mins = Math.floor(remaining % 3600 / 60)
    var secs = Math.floor(remaining % 60)

    if (current >= unixTime) {
      this.setState({ timeExpired: true })
    } else {
      this.setState({ days, hrs, mins, secs })
    }
  }

  render() {
    return (
      <Col className="d-flex justify-content-center">
        <Jumbotron className="p-5 mb-5 mx-2">
          <div className="text-center mb-3">
            {!this.state.timeExpired ? (
              <b>{this.state.days} days, {this.state.hrs} hrs, {this.state.mins} mins, {this.state.secs} secs</b>
            ) : (
              <b>TIME EXPIRED</b>
            )}
          </div>
          <img className="asset-img mb-3" src={!this.props.isLoadingMetadata ? this.props.tokenImage : "placeholder.jpeg"} alt="asset"/>
          <div className="asset-price">
            <Badge className="p-2" variant="info">Price: <b>Ξ {this.props.convertToEth(this.props.assetPrice)}</b></Badge>
            <Badge className="p-2" variant="info">Tax: <b>Ξ {this.props.convertToEth(this.props.assetTaxAmount)}</b></Badge>
          </div>
          <Accordion className="text-center mt-4">
            <Card>
              <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                <b>Creator</b>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  <a href={"https://opensea.io/" + this.props.creatorAddress} rel="noopener noreferrer" target="_blank">
                    {this.props.creatorAddress}
                  </a>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Accordion.Toggle as={Card.Header} variant="link" eventKey="1">
                <b>Owner</b>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  <a href={"https://opensea.io/" + this.props.ownerAddress} rel="noopener noreferrer" target="_blank">
                    {this.props.ownerAddress}
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

export default AssetToken;
