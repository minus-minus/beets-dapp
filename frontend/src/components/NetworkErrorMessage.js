import React from "react";
import { Alert, Button } from "react-bootstrap";

export function NetworkErrorMessage({ message, dismiss }) {
  return (
    <Alert variant="danger" className="text-center">
      Network Error: {message}
      <Button
        className="close mx-2"
        variant="light"
        data-dismiss="alert"
        aria-label="Close"
        onClick={dismiss}
      >
        <span aria-hidden="true">&times;</span>
      </Button>
    </Alert>
  );
}
