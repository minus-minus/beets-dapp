import React, { Component } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import "../stylesheets/HarbergerAsset.css";

class Navigation extends Component {
  render() {
    return (
      <Navbar bg="dark">
        <Container>
          <Navbar.Brand>
            <img className="beets-logo" src="beets.png" alt="BeetsDAO"/>
          </Navbar.Brand>
          <Navbar.Brand className="connected-account">
            <Button className="py-2 px-4" variant="warning">{this.props.minifyAddress(this.props.selectedAddress)}</Button>
          </Navbar.Brand>
        </Container>
      </Navbar>
    )
  }
};

export default Navigation;
