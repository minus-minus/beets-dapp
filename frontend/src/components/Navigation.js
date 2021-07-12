import React, { Component } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "../stylesheets/Dapp.css";

class Navigation extends Component {
  render() {
    const selectedAddress = this.props.minifyHash(this.props.selectedAddress)

    return (
      <Navbar collapseOnSelect expand="md">
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
          <Navbar.Toggle className="navbar-light"/>
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Item>
                <Nav.Link className="mx-2 disabled" eventKey="1" href="/euler-beats/prints">
                  Euler Beats
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className="mx-2" eventKey="2" href="/harberger-taxes/assets">
                  Harberger Taxes
                </Nav.Link>
              </Nav.Item>
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
          </Navbar.Collapse>
        </Container>
      </Navbar>
    )
  }
};

export default Navigation;
