import React, { Component } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "../stylesheets/HarbergerAsset.css";

class Navigation extends Component {
  render() {
    return (
      <Navbar bg="dark">
        <Container>
          <Navbar.Brand>
            <img className="beets-logo" src="beets.png" alt="BeetsDAO"/>
          </Navbar.Brand>
          <Nav className="me-auto mx-4">
            <Nav.Link className="mx-3" href="/euler-beats">Euler Beats</Nav.Link>
            <Nav.Link className="mx-3" href="/harberger-taxes">Harberger Taxes</Nav.Link>
          </Nav>
          <Navbar.Brand className="connected-account justify-content-end">
            {this.props.selectedAddress ? (
              <Button className="py-2 px-4" variant="warning">
                {this.props.minifyHash(this.props.selectedAddress)}
              </Button>
            ) : (
              <Button className="py-2 px-4" variant="warning" onClick={this.props.connectWallet}>
                Connect Wallet
              </Button>
            )}
          </Navbar.Brand>
        </Container>
      </Navbar>
    )
  }
};

export default Navigation;
