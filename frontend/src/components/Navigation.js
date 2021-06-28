import React, { Component } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { HTAX_TOKEN_ID } from "../utils/HTAX/constants";
import "../stylesheets/HarbergerAsset.css";

class Navigation extends Component {
  render() {
    const selectedAddress = this.props.minifyHash(this.props.selectedAddress)

    return (
      <Navbar>
        <Container>
          <Navbar.Brand>
            <Nav.Link href="/">
              <img className="logo" src="/logo.png" alt="BeetsDAO"/>
            </Nav.Link>
          </Navbar.Brand>
          <Nav className="me-auto mx-4">
            <Nav.Link className="mx-3" href="/euler-beats">Euler Beats</Nav.Link>
            <Nav.Link className="mx-3" href={"/harberger-taxes/asset/" + HTAX_TOKEN_ID}>Harberger Taxes</Nav.Link>
          </Nav>
          <Navbar.Brand className="connected-account justify-content-end">
            {selectedAddress ? (
              <Button className="py-2 px-4" variant="warning">
                {selectedAddress}
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
