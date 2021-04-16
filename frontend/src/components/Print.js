import React from "react";

export function Print({contractAddress, printTokenId, originalTokenId, release, trackNumber, price, priceBn, currentSupply, mintPrintLink, videoLink}) {

  return (
    <div className="col-sm-6" style={{paddingTop: '10px'}}>
      <div className="card">
        <video className="AssetMedia--video" controlsList="nodownload"
               controls src={`${videoLink}`}  />
          <div className="card-body">
            <h5 className="card-title">Track {trackNumber}</h5>
            <p className="card-text">Current supply: {currentSupply}<p>Price: {price} ETH</p></p>
            <a href="#" className="btn btn-primary" onClick={() => mintPrintLink(originalTokenId, priceBn)}>Mint</a>
          </div>
      </div>
    </div>
  );
}