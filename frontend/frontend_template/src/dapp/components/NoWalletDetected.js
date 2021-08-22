import React from "react";
import { Row, Col } from "react-bootstrap";

export function NoWalletDetected() {
  return (
    <div className="container">
      <Row className="justify-content-center">
        <Col className="my-5 text-center">
          <p>
            No Ethereum wallet was detected.<br/>
            Please install{" "}
            <a
              href="http://metamask.io"
              rel="noopener noreferrer"
              target="_blank"
            >
              MetaMask
            </a>
          </p>
        </Col>
      </Row>
    </div>
  );
}
