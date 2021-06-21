import React, { Component } from "react";
import { Col, Jumbotron, Table } from "react-bootstrap";
import "../stylesheets/HarbergerAsset.css";

class AssetHistory extends Component {
  render() {
    return (
      <Col>
        <Jumbotron className="p-5 mb-5 mx-2">
          <h4 className="text-center mb-3">Provenance</h4>
          <div className="asset-history p-4 text-center">
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
      </Col>
    )
  }
};

export default AssetHistory;
