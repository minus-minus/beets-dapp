import React from "react";
import { NetworkError } from "./NetworkError";
import { Row, Col, Button } from "react-bootstrap";

export function ConnectWallet({ connectWallet, networkError, dismiss }) {
  return (
    <div className="container">
      <Row className="justify-content-center">
        <Col className="my-3 text-center">
          {networkError && (
            <NetworkError
              message={networkError}
              dismiss={dismiss}
            />
          )}
        </Col>
      </Row>
      <Row>
        <Col className="my-4 text-center">
          <Button
            variant="warning"
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        </Col>
      </Row>
    </div>
  );
}
