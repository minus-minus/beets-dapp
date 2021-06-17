import React, { Component } from "react";
import moment from "moment";
import "moment-timezone";
import { Container, Navbar, Row, Col, Button } from "react-bootstrap";
import "../stylesheets/HarbergerAsset.css";

class HarbergerAsset extends Component {
  constructor(props) {
    super(props)
    this.state = {
      toggleHeader: true
    }

    this.minifyHash = this.minifyHash.bind(this)
  }

  minifyHash = (hash) => {
    const length = hash.length
    return `${hash.substring(0, 6)}...${hash.substring(length-4, length)}`
  }

  render() {
    const connectedAccount = this.minifyHash(this.props.selectedAddress)

    return (
      <div>
        <Navbar bg="dark">
          <Container>
            <Navbar.Brand className="logo">
              <img className="beets-logo" src="beets.png" alt="BeetsDAO"/>
            </Navbar.Brand>
            <Navbar.Brand className="connected-account">
              <Button className="py-2 px-4" variant="warning">{connectedAccount}</Button>
            </Navbar.Brand>
          </Container>
        </Navbar>
        <Container className="mt-5">
          <Row>
            <h1 className="text-center mb-5">Harberger Taxes</h1>

            <Col className="d-flex justify-content-center">

            </Col>
            <Col className="d-flex justify-content-center">

            </Col>
          </Row>
        </Container>
      </div>
    )
  }
};

export default HarbergerAsset;
