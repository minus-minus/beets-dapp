import React from "react";
import { Alert, Button } from "react-bootstrap";

export function TransactionSuccessMessage({ message, dismiss }) {
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
        <span className="justify-content-right" aria-hidden="true">&times;</span>
      </Button>
    </Alert>
  );
}
