import React, { Component } from "react";
import { ethers } from "ethers";
import moment from "moment";
import "moment-timezone";
import BigNumber from "bignumber.js"
import { Container, Navbar, Row, Col, Button } from "react-bootstrap";
import { HTAX_CREATOR_ADDRESS, HTAX_IPFS_HASH } from "../utils/HTAX/constants";
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

  handleClick = () => {
    this.setState({ toggleHeader: !this.state.toggleHeader })
  }

  convertToEth = (value) => {
    return parseFloat(ethers.utils.formatEther(value)).toFixed(4)
  }

  convertToWei = (value) => {
    return BigNumber(value.toString()).toFixed()
  }

  parseInput = (value) => {
    const priceEth = value.split('Ξ ')[1]
    const priceHex = ethers.utils.parseUnits(priceEth, 'ether')
    return BigNumber(priceHex.toString()).toFixed()
  }

  parseError = (err) => {
    return err.data ? err.data.message.split('revert ')[1] : err.message
  }

  formatTime = (timestamp) => {
    return timestamp ? moment.unix(timestamp).tz('America/Los_Angeles').format('MMMM Do YYYY, h:mm:ss a z') : null
  }

  timeRemaining = (timestamp) => {
    var current = Math.round((new Date()).getTime() / 1000)
    var remaining = timestamp ? (timestamp - current) : null
    if (!remaining) return

    var d = Math.floor(remaining / (3600 * 24))
    var h = Math.floor(remaining % (3600 * 24) / 3600)
    var m = Math.floor(remaining % 3600 / 60)
    var s = Math.floor(remaining % 60)

    if (current >= timestamp || this.props.timeExpired) {
      return "TIME EXPIRED"
    } else {
      return `${d} days, ${h} hrs, ${m} mins, ${s} secs`
    }
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
            {this.props.selectedAddress === HTAX_CREATOR_ADDRESS && !this.props.tokenURI ? (
              <div className="text-center my-2">
                <Button className="py-2 px-3" variant="success" onClick={(e) => {this.props.mintToken(HTAX_IPFS_HASH)}}>Mint Token</Button>
              </div>
            ) : (
              null
            )}
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
