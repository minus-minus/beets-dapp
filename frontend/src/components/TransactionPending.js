import React from "react";
import { Alert } from "react-bootstrap";

export function TransactionPending({ transactionHash }) {
  return (
    <Alert variant="primary" className="text-center">
      Waiting for transaction <b>{transactionHash}</b> to be mined...
    </Alert>
  );
}
