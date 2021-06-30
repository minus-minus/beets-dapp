import React, { Component } from "react";
import ipfsHash from "../../contracts/ipfs.json";
// import arweave from "../../contracts/arweave.json";
import { HTAX_CREATOR_ADDRESS } from "../../utils/HTAX/constants";
import { Button } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";

class MintToken extends Component {
  render() {
    const adminAddress = this.props.adminAddress
    const selectedAddress = this.props.selectedAddress

    return (
      <div className="text-center mt-5">
        {selectedAddress === adminAddress && (
          <Button
            className="py-2 px-4"
            variant="success"
            onClick={(e) => {this.props.mintToken(HTAX_CREATOR_ADDRESS, ipfsHash.HarbergerAsset)}}
          >
            Mint Token
          </Button>
        )}
      </div>
    )
  }
};

export default MintToken;
