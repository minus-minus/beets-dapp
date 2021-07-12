import React from "react";
import { Alert, Button } from "react-bootstrap";

const ETHERSCAN_TX_URI = "https://rinkeby.etherscan.io/tx/"

export function TransactionPending({ transactionHash, minifyHash, dismiss }) {
  return (
    <Alert variant="primary" className="text-center">
      Transaction Pending: <b><a href={ETHERSCAN_TX_URI + transactionHash} style={{ color: "#fff"}} rel="noopener noreferrer" target="_blank">{minifyHash(transactionHash)}</a></b>
      <Button
        className="close mx-2"
        style={{ float: "right" }}
        variant="transparent"
        data-dismiss="alert"
        aria-label="Close"
        onClick={dismiss}
      >
        <b><span style={{ color: "#fff" }} aria-hidden="true">&times;</span></b>
      </Button>
    </Alert>
  );
}
