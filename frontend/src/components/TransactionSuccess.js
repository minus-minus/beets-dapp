import React from "react";
import { Alert, Button } from "react-bootstrap";

export function TransactionSuccess({ message, dismiss }) {
  return (
    <Alert variant="success" className="text-center">
      Transaction Successful: {message}
      <Button
        className="close mx-2"
        style={{ float: "right" }}
        variant="transparent"
        data-dismiss="alert"
        aria-label="Close"
        onClick={dismiss}
      >
        <span style={{ color: "#fff" }} aria-hidden="true">&times;</span>
      </Button>
    </Alert>
  );
}
