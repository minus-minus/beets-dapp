import React from "react";
import { Alert, Button } from "react-bootstrap";

export function TransactionErrorMessage({ message, dismiss }) {
  return (
    <Alert variant="danger" className="text-center">
      Transaction Failed: {message.split("'")[1]}
      <Button
        className="close mx-2"
        style={{ float: "right" }}
        variant="transparent"
        data-dismiss="alert"
        aria-label="Close"
        onClick={dismiss}
      >
        <span aria-hidden="true">&times;</span>
      </Button>
    </Alert>
  );
}
