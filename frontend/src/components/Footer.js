import React, { Component } from "react";
import { Navbar, Container } from "react-bootstrap";
import "../stylesheets/HarbergerAsset.css";

class Footer extends Component {
  render() {
    return (
      <Navbar className="footer mt-5">
        <Container className="justify-content-center">
          <p className="footer-text">Powered By BeetsDAO</p>
        </Container>
      </Navbar>
    )
  }
};

export default Footer;
