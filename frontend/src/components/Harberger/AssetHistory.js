import React, { Component } from "react";
import moment from "moment";
import "moment-timezone";
import { Col, Jumbotron, Table } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";

// const OPEN_SEA_BASE_URI = "https://opensea.io/";
const ETHERSCAN_BASE_URI = "https://etherscan.io/address/"

class AssetHistory extends Component {
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
    return (
      <Col className="d-flex justify-center">
        <Jumbotron className="mb-5 mx-2 p-5">
          <h4 className="text-center mb-3">Provenance</h4>
          <div className="asset-history text-center p-4">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {this.props.eventLogs.filter(e => e.name !== "Approval").reverse().map((event, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        {event.args.timestamp && (
                          this.formatTime(event.args.timestamp.toString())
                        )}
                      </td>
                      <td>{event.name}</td>
                      <td>
                        <a href={ETHERSCAN_BASE_URI + event.args.from} rel="noopener noreferrer" target="_blank">
                          {this.props.minifyHash(event.args.from)}
                        </a>
                      </td>
                      <td>
                        <a href={ETHERSCAN_BASE_URI + event.args.to} rel="noopener noreferrer" target="_blank">
                          {this.props.minifyHash(event.args.to)}
                        </a>
                      </td>
                      <td>
                        {event.args.value && (
                          `Ξ ${parseFloat(this.props.convertToEth(event.args.value.toString()))}`
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

export default AssetHistory;
