import React, { Component } from "react";
import { Col, Button } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";

class AssetOwner extends Component {
  render() {
    return (
      <Col className="d-flex justify-content-center mb-5">
        {(this.props.selectedAddress === this.props.creatorAddress || this.props.selectedAddress === this.props.adminAddress) && (
          <Button className="mx-3 py-2 px-3" variant="success" onClick={(e) => {this.props.collectFunds()}}>
            Collect Funds
          </Button>
        )}
        {this.props.selectedAddress === this.props.creatorAddress && (
          <Button className="mx-3 py-2 px-3" variant="danger" onClick={(e) => {this.props.reclaimAsset()}}>
            Reclaim Asset
          </Button>
        )}
      </Col>
    )
  }
}

export default AssetOwner;
