import React, { Component } from "react";
import ipfsHash from "../../contracts/ipfs.json";
// import arweave from "../../contracts/arweave.json";
import { HTAX_CREATOR_ADDRESS } from "../../utils/HTAX/constants";
import { Button } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";

class MintAsset extends Component {
  render() {
    const adminAddress = this.props.adminAddress
    const selectedAddress = this.props.selectedAddress

    return (
      <div className="text-center mt-5">
        <Button
          className="my-2 py-2 px-4"
          variant="success"
          disabled={selectedAddress !== adminAddress}
          title="Create Asset"
          onClick={(e) => {this.props.mintAsset(ipfsHash.HarbergerAsset, HTAX_CREATOR_ADDRESS)}}
        >
          Mint Token
        </Button>
      </div>
    )
  }
};

export default MintAsset;
