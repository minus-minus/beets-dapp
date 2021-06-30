import React, { Component } from "react";
import { Navbar, Container } from "react-bootstrap";
import "../stylesheets/HarbergerAsset.css";

class Footer extends Component {
  render() {
    return (
      <Navbar className="footer mt-5">
        <Container className="justify-content-center">
          <p className="footer-text">
            Copyright © 2021 BeetsDAO, LLC
          </p>
        </Container>
      </Navbar>
    )
  }
};

export default Footer;
