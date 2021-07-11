import React, { Component } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "../stylesheets/Dapp.css";

class Navigation extends Component {
  render() {
    const selectedAddress = this.props.minifyHash(this.props.selectedAddress)

    return (
      <Navbar>
        <Container>
          <Navbar.Brand>
            <Nav.Link href="/">
              <img
                className="beets"
                src="/logos/beets.png"
                alt="BeetsDAO"
              />
            </Nav.Link>
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link className="mx-2 disabled" href="/euler-beats/prints">Euler Beats</Nav.Link>
            <Nav.Link className="mx-2" href="/harberger-taxes/assets">Harberger Taxes</Nav.Link>
          </Nav>
          <Navbar.Brand className="connected-account justify-content-end">
            {selectedAddress ? (
              <Button className="py-2 px-4" variant="warning">
                {selectedAddress}
              </Button>
            ) : (
              <Button
                className="py-2 px-4"
                variant="warning"
                onClick={this.props.connectWallet}
              >
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
