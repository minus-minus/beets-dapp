import React, { Component } from "react";
import { Navbar, Container } from "react-bootstrap";
import "../stylesheets/Dapp.css";

class Footer extends Component {
  render() {
    return (
      <Navbar className="footer">
        <Container className="justify-content-center">
          <p className="footer-text">
            Powered by BeetsDAO
          </p>
        </Container>
      </Navbar>
    )
  }
};

export default Footer;
