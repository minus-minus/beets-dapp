import React, { Component } from "react";
import ipfsHash from "../contracts/ipfs-hash.json";
import { HTAX_CREATOR_ADDRESS } from "../utils/HTAX/constants";
import { Button } from "react-bootstrap";
import "../stylesheets/HarbergerAsset.css";

class AssetHeader extends Component {
  render() {
    return (
      <div className="text-center mt-5">
        <h1 className="mb-5">Harberger Taxes</h1>
        {this.props.selectedAddress === HTAX_CREATOR_ADDRESS && !this.props.tokenURI ? (
          <Button className="py-2 px-4" variant="success" onClick={(e) => {this.props.mintToken(ipfsHash.HarbergerAsset)}}>
            Mint Token
          </Button>
        ) : (
          null
        )}
      </div>
    )
  }
};

export default AssetHeader;
