import React, { Component } from "react";
import moment from "moment";
import "moment-timezone";
import CurrencyInput from "react-currency-input-field";
import { Row, Col, Jumbotron, Table, Button } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";

const axios = require('axios');
const graphURL = "https://api.thegraph.com/subgraphs/name/ourzora/zora-v1-rinkeby"
const ETHERSCAN_TX_URI = "https://rinkeby.etherscan.io/tx/";
const OPEN_SEA_BASE_URI = "https://testnets.opensea.io/";

class Auction extends Component {
  constructor(props) {
    super(props)
    this.state = {
      auctionId: undefined,
      auctionBids: []
    }

    this.createBid = this.createBid.bind(this)
    this.formatTime = this.formatTime.bind(this)
  }

  componentDidMount() {
    this.reserveAuctionRequest();
  }

  async reserveAuctionRequest() {
    const query = {
      query: `query reserveAuctions($approved: Boolean!, $tokenContract: ID!) {
        reserveAuctions(
          where: {
            approved: $approved,
            tokenContract: $tokenContract
          })
        {
          id
          approved
          currentBid {
            id
          }
          duration
          expectedEndTimestamp
          finalizedAtTimestamp
          previousBids {
            id
          }
          reservePrice
          status
          tokenOwner {
            id
          }
          createdAtTimestamp
        }
      }`,
      variables: {
        approved: true,
        tokenContract: this.props.contractAddress.toLowerCase()
      }
    }

    try {
      const response = await axios.post(graphURL, query)
      const reserveAuction = response.data.data.reserveAuctions[0]
      console.log("Reserve Auction:", reserveAuction)
      const currentBid = reserveAuction["currentBid"]
      const previousBids = reserveAuction["previousBids"]

      this.setState({ reserveAuction, currentBid, previousBids })
    } catch(err) {
      console.log(err);
    }

    if (this.state.currentBid) this.currentBidRequest(this.state.currentBid)
    this.previousBidsRequest(this.state.previousBids)
  }

  async currentBidRequest(currentBid) {
    const query = {
      query: `query reserveAuctionBid($id: ID!) {
        reserveAuctionBid(
          id: $id
        )
        {
          amount
          bidder {
            id
          }
          bidType
          createdAtTimestamp
          transactionHash
        }
      }`,
      variables: {
        id: currentBid["id"]
      }
    }

    try {
      const response = await axios.post(graphURL, query)
      const currentBid = response.data.data.reserveAuctionBid
      // console.log("Current Bid:", currentBid)
      this.setState({ auctionBids: [...this.state.auctionBids, currentBid] });
    } catch(err) {
      console.log(err);
    }
  }

  async previousBidsRequest(previousBids) {
    previousBids.map(async(previousBid, index) => {
      const query = {
        query: `query inactiveReserveAuctionBid($id: ID!) {
          inactiveReserveAuctionBid(
            id: $id
          )
          {
            amount
            bidder {
              id
            }
            bidType
            createdAtTimestamp
            transactionHash
          }
        }`,
        variables: {
          id: previousBid["id"]
        }
      }

      try {
        const response = await axios.post(graphURL, query)
        const previousBid = response.data.data.inactiveReserveAuctionBid
        // console.log("Previous Bid:", previousBid)
        this.setState({ auctionBids: [...this.state.auctionBids, previousBid] });
      } catch(err) {
        console.log(err);
      }
    })
  }

  createBid = (event) => {
    event.preventDefault()
    var value = this.props.convertToWei(this.bid.value)
    value = (value === undefined) ? 0 : value
    this.props.createBid(this.state.reserveAuction["id"], value)
  }

  formatTime = (unixTime) => {
    if (!unixTime) return
    const localtz = moment.tz.guess()
    return moment.unix(unixTime).tz(localtz).format('M/DD/YY h:mm A')
  }

  render() {
    const auctionId = this.state.reserveAuction ? this.state.reserveAuction["id"] : null
    const auctionEnd = this.state.reserveAuction ? this.formatTime(this.state.reserveAuction["expectedEndTimestamp"]) : null
    const reservePrice = this.state.reserveAuction ? this.state.reserveAuction["reservePrice"] : null
    const auctionBids = this.state.auctionBids.sort((a, b) => a["createdAtTimestamp"] - b["createdAtTimestamp"]).reverse();
    const creatorAddress = this.props.creatorAddress
    const curatorAddress = this.props.creatorAddress
    const selectedAddress = this.props.selectedAddress
    const tokenId = this.props.tokenId

    return (
      <div>
        <Row>
          <Col className="d-flex justify-content-center my-4">
            <div className="text-center">
              <form onSubmit={this.createBid}>
                <CurrencyInput
                  prefix="Ξ "
                  decimalsLimit={4}
                  placeholder="Ξ 0.00"
                  ref={(input) => {this.bid = input}}
                />
                <br/>
                <Button
                  className="my-3 mx-3 py-2 px-4"
                  required={true}
                  variant="primary"
                  title="Create Bid"
                  type="submit"
                >
                  Bid
                </Button>
              </form>
            </div>
          </Col>
        </Row>
        <Row>
          <Col className="d-flex justify-center">
            <Jumbotron className="mb-5 p-5">
              <h4 className="text-center mb-4">Auction</h4>
              <div className="asset-auction text-center p-4">
                <div className="auction-info py-2">
                  <h6 className="text-center px-3">Expected End: <b>{auctionEnd}</b></h6>
                  <h6 className="text-center px-3">Reserve Price: <b>Ξ {reservePrice}</b></h6>
                </div>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Created</th>
                      <th>From</th>
                      <th>Bid</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                  {auctionBids.map((bid, index) => {
                    return (
                      <tr key={index}>
                        <td>
                          {this.formatTime(bid["createdAtTimestamp"])}
                        </td>
                        <td>
                          <a href={OPEN_SEA_BASE_URI + bid["bidder"]["id"]} rel="noopener noreferrer" target="_blank">
                            {this.props.minifyHash(bid["bidder"]["id"])}
                          </a>
                        </td>
                        <td>
                          <a href={ETHERSCAN_TX_URI + bid["transactionHash"]} rel="noopener noreferrer" target="_blank">
                            {bid["bidType"]}
                          </a>
                        </td>
                        <td>
                          Ξ {parseFloat(this.props.convertToEth(bid["amount"].toString()))}
                        </td>
                      </tr>
                    )
                  })}
                  </tbody>
                </Table>
              </div>
            </Jumbotron>
          </Col>
        </Row>
        <Row>
          <Col className="d-flex justify-content-center mb-5">
            {(selectedAddress === creatorAddress) && (!auctionId) && (
              <Button
                className="mx-3 py-2 px-3"
                variant="primary"
                title="Create Auction"
                onClick={(e) => {this.props.createAuction(creatorAddress, tokenId)}}
              >
                Create Auction
              </Button>
            )}
            {(selectedAddress === curatorAddress) && (auctionId) && (
              <Button
                className="mx-3 py-2 px-3"
                variant="success"
                title="Begin Auction"
                onClick={(e) => {this.props.beginAuction(auctionId)}}
              >
                Begin Auction
              </Button>
            )}
            {(selectedAddress === creatorAddress || selectedAddress === curatorAddress) && (auctionId) && (
              <Button
                className="mx-3 py-2 px-3"
                variant="warning"
                title="Cancel Auction"
                onClick={(e) => {this.props.cancelAuction(auctionId)}}
              >
                Cancel Auction
              </Button>
            )}
            {(selectedAddress === creatorAddress || selectedAddress === curatorAddress) && (auctionId) && (
              <Button
                className="mx-3 py-2 px-3"
                variant="danger"
                title="Cancel Auction"
                onClick={(e) => {this.props.endAuction(auctionId)}}
              >
                End Auction
              </Button>
            )}
          </Col>
        </Row>
      </div>
    )
  }
};

export default Auction;
