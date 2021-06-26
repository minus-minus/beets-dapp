import React, { Component } from "react";
import ipfsHash from "../../contracts/ipfs-hash.json";
import { HTAX_CREATOR_ADDRESS } from "../../utils/HTAX/constants";
import { Button } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";

class AssetHeader extends Component {
  render() {
    return (
      <div className="text-center mt-5">
        {this.props.selectedAddress === this.props.adminAddress && (
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

export default AssetHeader;
