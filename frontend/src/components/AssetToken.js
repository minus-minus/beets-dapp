import React, { Component } from "react";
import { Col, Jumbotron, Button } from "react-bootstrap";
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
          <div className="font-bold text-center mb-3">
            {!this.state.timeExpired ? (
              <p>{this.state.days} days, {this.state.hrs} hrs, {this.state.mins} mins, {this.state.secs} secs</p>
            ) : (
              <p>TIME EXPIRED</p>
            )}
          </div>
          {this.props.tokenImage ? (
            <img className="asset-token" src={this.props.tokenImage} alt="space"/>
          ) : (
            <img className="placeholder-img" src='placeholder.jpeg' alt="placeholder"/>
          )}
          <div className="price mt-4 mb-3">
            <Button className="my-2 mx-1 py-2 px-3" variant="secondary">
              Price: Ξ {this.props.convertToEth(this.props.assetPrice)}
            </Button>
            <Button className="my-2 mx-1 py-2 px-3" variant="info">
              Tax: Ξ {this.props.convertToEth(this.props.assetTaxAmount)}
            </Button>
          </div>
          <div className="text-center mt-4 mb-3">
            <span className="font-bold">Artist: </span>
            <a href={"https://opensea.io/" + this.props.creatorAddress} rel="noopener noreferrer" target="_blank">
              {this.props.minifyAddress(this.props.creatorAddress)}
            </a><br/><br/>
            <span className="font-bold">Owner: </span>
            <a href={"https://opensea.io/" + this.props.ownerAddress} rel="noopener noreferrer" target="_blank">
              {this.props.minifyAddress(this.props.ownerAddress)}
            </a>
          </div>
        </Jumbotron>
      </Col>
    )
  }
};

export default AssetToken;
