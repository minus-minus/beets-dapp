import React, { Component } from "react";
import { Col, Button } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";

class Ownership extends Component {
  render() {
    const adminAddress = this.props.adminAddress
    const creatorAddress = this.props.creatorAddress
    const selectedAddress = this.props.selectedAddress
    const tokenId = this.props.tokenId

    return (
      <Col className="d-flex justify-content-center mb-5">
        {(selectedAddress === creatorAddress || selectedAddress === adminAddress) && (
          <Button
            className="mx-3 py-2 px-3"
            variant="success"
            onClick={(e) => {this.props.collectFunds(tokenId)}}
          >
            Collect Funds
          </Button>
        )}
        {selectedAddress === creatorAddress && (
          <Button
            className="mx-3 py-2 px-3"
            variant="danger"
            onClick={(e) => {this.props.reclaimAsset(tokenId)}}
          >
            Reclaim Asset
          </Button>
        )}
      </Col>
    )
  }
}

export default Ownership;
