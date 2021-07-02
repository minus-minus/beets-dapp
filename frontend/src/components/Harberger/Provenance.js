import React, { Component } from "react";
import moment from "moment";
import "moment-timezone";
import { Col, Jumbotron, Table } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";

const OPEN_SEA_BASE_URI = "https://opensea.io/";

class Provenance extends Component {
  constructor(props) {
    super(props)

    this.formatTime = this.formatTime.bind(this)
  }

  formatTime = (unixTime) => {
    if (!unixTime) return
    const localtz = moment.tz.guess()
    return moment.unix(unixTime).tz(localtz).format('M/DD/YY h:mm A')
  }

  render() {
    const eventLogs = this.props.eventLogs.filter(e => e.name !== "Approval").reverse()
    const tokenEvents = eventLogs.filter(e => e.args.tokenId.toNumber() !== this.props.tokenId)

    return (
      <Col className="d-flex justify-center">
        <Jumbotron className="mb-5 mx-2 p-5">
          <h4 className="text-center mb-3">Provenance</h4>
          <div className="asset-history text-center p-4">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Token</th>
                  <th>Event</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {tokenEvents.map((event, index) => {
                  const timestamp = event.args.timestamp
                  const tokenId = event.args.tokenId
                  const name = event.name
                  const from = event.args.from
                  const to = event.args.to
                  const value = event.args.value

                  return (
                    <tr key={index}>
                      <td>
                        {timestamp && (
                          this.formatTime(timestamp.toString())
                        )}
                      </td>
                      <td>{tokenId.toNumber()}</td>
                      <td>{name}</td>
                      <td>
                        <a href={OPEN_SEA_BASE_URI + from} rel="noopener noreferrer" target="_blank">
                          {this.props.minifyHash(from)}
                        </a>
                      </td>
                      <td>
                        <a href={OPEN_SEA_BASE_URI + to} rel="noopener noreferrer" target="_blank">
                          {this.props.minifyHash(to)}
                        </a>
                      </td>
                      <td>
                        {value && (
                          `Ξ ${parseFloat(this.props.convertToEth(value.toString()))}`
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
        </Jumbotron>
      </Col>
    )
  }
};

export default Provenance;
