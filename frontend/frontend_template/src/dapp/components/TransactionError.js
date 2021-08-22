import React from "react";
import { Alert, Button } from "react-bootstrap";

export function TransactionError({ message, dismiss }) {
  return (
    <Alert variant="danger" className="text-center" style={{ borderRadius: 0 }}>
      Transaction Failed: {message}
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
