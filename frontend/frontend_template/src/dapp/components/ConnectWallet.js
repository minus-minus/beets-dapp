import React from "react";
import { NetworkError } from "./NetworkError";
import { Container, Row, Col, Button } from "react-bootstrap";

export function ConnectWallet({ connectWallet, networkError, dismiss }) {
  return (
    <Container>
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
          <img
            className="my-1"
            style={{ height: "100px", width: "133px" }}
            src="/logos/metamask.gif"
            alt="MetaMask"
          /><br/>
          <Button
            variant="warning"
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
