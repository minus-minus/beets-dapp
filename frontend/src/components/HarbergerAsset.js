import React, { Component } from "react";
import { ethers } from "ethers";
import moment from "moment";
import "moment-timezone";
import BigNumber from "bignumber.js"
import DatePicker from 'react-datepicker'
import CurrencyInput from 'react-currency-input-field'
import { Container, Navbar, Row, Col, Jumbotron, Table, Button } from "react-bootstrap";
import "../stylesheets/HarbergerAsset.css";
import 'react-datepicker/dist/react-datepicker.css'

import { HTAX_CREATOR_ADDRESS } from "../utils/HTAX/constants";
import ipfsHash from "../contracts/ipfs-hash.json";

class HarbergerAsset extends Component {
  constructor(props) {
    super(props)
    this.state = {
      toggleHeader: true
    }

    this.handleToggle = this.handleToggle.bind(this)
    this.minifyHash = this.minifyHash.bind(this)
    this.convertToEth = this.convertToEth.bind(this)
    this.convertToWei = this.convertToWei.bind(this)
    this.formatTime = this.formatTime.bind(this)
    this.timeRemaining = this.timeRemaining.bind(this)
  }

  handleToggle = () => {
    this.setState({ toggleHeader: !this.state.toggleHeader })
  }

  minifyHash = (address) => {
    if (!address) return

    const length = address.length
    return `${address.substring(0, 6)}...${address.substring(length-4, length)}`
  }

  convertToEth = (value) => {
    if (!value) return

    return parseFloat(ethers.utils.formatEther(value)).toFixed(4)
  }

  convertToWei = (value) => {
    if (!value) return

    const priceEth = value.toString().split('Ξ ')[1]
    const priceWei = ethers.utils.parseUnits(priceEth, 'ether')
    return BigNumber(priceWei.toString()).toFixed()
  }

  formatTime = (unixTime) => {
    if (!unixTime) return

    const localtz = moment.tz.guess()
    return moment.unix(unixTime).tz(localtz).format('MMMM Do YYYY, h:mm:ss a z')
  }

  timeRemaining = (unixTime) => {
    if (!unixTime) return

    var current = Math.round((new Date()).getTime() / 1000)
    var remaining = unixTime - current

    var d = Math.floor(remaining / (3600 * 24))
    var h = Math.floor(remaining % (3600 * 24) / 3600)
    var m = Math.floor(remaining % 3600 / 60)
    var s = Math.floor(remaining % 60)

    if (current >= unixTime || this.props.timeExpired) {
      return "TIME EXPIRED"
    } else {
      return `${d} days, ${h} hrs, ${m} mins, ${s} secs`
    }
  }

  render() {
    return (
      <div>
        <Navbar bg="dark">
          <Container>
            <Navbar.Brand>
              <img className="logo" src="beets.png" alt="BeetsDAO"/>
            </Navbar.Brand>
            <Navbar.Brand className="connected-account">
              <Button className="py-2 px-4" variant="warning">{this.minifyHash(this.props.selectedAddress)}</Button>
            </Navbar.Brand>
          </Container>
        </Navbar>
        <Container className="mt-5">
          <Row>
            <h1 className="text-center mb-5">Harberger Taxes</h1>
            {this.props.selectedAddress === HTAX_CREATOR_ADDRESS && !this.props.tokenURI ? (
              <div className="text-center my-2">
                <Button className="py-2 px-4" variant="success" onClick={(e) => {this.props.mintToken(ipfsHash.HarbergerAsset)}}>Mint Token</Button>
              </div>
            ) : (
              null
            )}
              {!this.props.isLoadingToken ? (
                <Col className="d-flex justify-content-center">
                  <Jumbotron className="p-5 mb-5 mx-2">
                    <p className="text-center mb-3"><b>{this.timeRemaining(this.props.assetDeadline)}</b></p>
                    <div className="token d-flex justify-content-center">
                      {this.props.tokenImage ? (
                        <img className="token" src={this.props.tokenImage} alt="space"/>
                      ) : (
                        <img className="placeholder-img" src='placeholder.jpeg' alt="placeholder"/>
                      )}
                    </div>
                    <div className="price mt-4 mb-3">
                      {this.props.assetPrice ? <Button className="my-2 py-2 px-3" variant="secondary">Price: Ξ {this.convertToEth(this.props.assetPrice)}</Button> : null}
                      {this.props.assetTaxAmount ? <Button className="my-2 py-2 px-3" variant="info">Tax: Ξ {this.convertToEth(this.props.assetTaxAmount)}</Button> : null}
                    </div>
                    <div className="text-center mt-4 mb-3">
                      {this.props.tokenURI ? (
                        <div>
                          <p><b>Artist</b>: <a href={"https://opensea.io/" + this.props.creatorAddress} rel="noopener noreferrer" target="_blank">{this.minifyHash(this.props.creatorAddress)}</a></p>
                          <p><b>Owner</b>: <a href={"https://opensea.io/" + this.props.ownerAddress} rel="noopener noreferrer" target="_blank">{this.minifyHash(this.props.ownerAddress)}</a></p>
                        </div>
                      ) : (
                        <Button className="mt-2 mb-4 py-2 px-3" variant="success" onClick={(e) => {this.props.mintToken(this.props.tokenURI)}}>Mint</Button>
                      )}
                    </div>
                  </Jumbotron>
                </Col>
              ) : (
                null
              )}
              {!this.props.isLoadingToken ? (
                <Col className="d-flex justify-content-center">
                  <Jumbotron className="p-5 mb-5 mx-2">
                    {this.state.toggleHeader ? (
                      <div>
                        <div className="text-center mb-3">
                          <Button className="subheader" variant="success" onClick={this.handleToggle}>How It Works</Button>
                        </div>
                        <div className="explainer text-center p-4">
                          <p>Welcome to the land where smart contracts get intertwined in the crosshairs of economics. The Harberger Tax song is <b>ALWAYS</b> on sale. The owner of this asset <b>MUST</b> set a sales price while also paying the corresponding tax rate over a given period of time.</p>
                          <p>The higher the sales price, the higher the amount in taxes that must be deposited in order to extend the timer. If either of these conditions is failed to be met once the timer runs out, the creator of this NFT has the ability to reclaim their rightful asset.</p>
                        </div>
                        <div className="text-center mt-4 mb-3">
                          {!this.props.ownerAddress || (this.props.ownerAddress !== this.props.selectedAddress) ? (
                            <Button className="my-2 mx-3 py-2 px-4" variant="danger" disabled={parseFloat(this.props.assetPrice) === 0} onClick={this.props.buyAsset}>Buy</Button>
                          ) : (
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                this.props.listAsset(this.convertToWei(this.listing.value))
                              }}>
                              <CurrencyInput prefix="Ξ " decimalsLimit={4} ref={(input) => {this.listing = input}}/><br/>
                              <Button className="my-2 mx-3 py-2 px-4" variant="success" type="submit">List</Button>
                            </form>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-center mb-3">
                          <Button className="subheader" variant="primary" onClick={this.handleToggle}>Estimate Tax</Button>
                        </div>
                        <div className="explainer text-center p-4">
                          <h5>Calendar</h5>
                          <DatePicker className="my-2" />
                          <p className="mt-4">The tax rate can be calculated by applying a fixed percentage of {this.props.taxRatePercentage}% to the current sales price. For every 0.01Ξ that is deposited in taxes, the timer will extend for an additional 12 hours. You can adjust the calendar to estimate the total amount of taxes that would be due for that specified time period.</p>
                        </div>
                        <div className="text-center mt-4 mb-3">
                          {!this.props.ownerAddress || (this.props.ownerAddress !== this.props.selectedAddress) ? (
                            <Button className="my-2 mx-3 py-2 px-4" variant="danger" disabled={parseFloat(this.props.assetPrice) === 0} onClick={this.props.buyAsset}>Buy</Button>
                          ) : (
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                this.props.depositTax(this.convertToWei(this.deposit.value))
                              }}>
                              <CurrencyInput prefix="Ξ " decimalsLimit={4} ref={(input) => {this.deposit = input}}/><br/>
                              <Button className="my-2 mx-2 py-2 px-4" variant="primary" type="submit">Deposit</Button>
                            </form>
                          )}
                        </div>
                      </div>
                    )}
                    </Jumbotron>
                  </Col>
              ) : (
                null
              )}
          </Row>
          <Row>
            <Col>
              {!this.props.isLoadingToken ? (
                <Jumbotron className="p-5 mb-5 mx-2">
                  <h4 className="text-center mb-3">Provenance</h4>
                  <div className="provenance p-4 text-center">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Block</th>
                          <th>Date</th>
                          <th>Event</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.props.eventLogs.map((event, index) => {
                          return (
                            <tr key={index}>
                              <td>{event.blockNumber}</td>
                              <td>{event.timestamp}</td>
                              <td>{event.name}</td>
                              <td>{event.args[0]}</td>
                              <td>{event.args[1] || '-'}</td>
                              <td><img className="ether" src="/ether.png" alt="ether"/> {event.args[3] || '-'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Jumbotron>
              ) : (
                null
              )}
            </Col>
          </Row>
          <Row>
            <Col className="d-flex justify-content-center">
              <div className="text-center my-3">
                {!this.props.isLoadingToken && (this.props.selectedAddress === this.props.creatorAddress || this.props.selectedAddress === this.props.adminAddress) ? (
                  <Button className="py-2 px-3" variant="success" onClick={(e) => {this.props.collectFunds()}}>Collect Funds</Button>
                ) : (
                  null
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col className="d-flex justify-content-center">
              <div className="text-center my-3">
                {!this.props.isLoadingToken && this.props.selectedAddress === this.props.creatorAddress ? (
                  <Button className="mb-5 py-2 px-3" variant="danger" onClick={(e) => {this.props.reclaimAsset()}}>Reclaim Asset</Button>
                ) : (
                  null
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
};

export default HarbergerAsset;
