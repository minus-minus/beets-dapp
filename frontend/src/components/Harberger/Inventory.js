import React, { Component } from "react";
import { Row, Col, Card } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";

const axios = require('axios');

class Inventory extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.apiRequest();
  }

  async apiRequest() {
    this.props.assets.map(async(asset, index) => {
      const tokenId = asset.tokenId;
      const tokenURI = await this.props.contract.tokenURI(tokenId);

      try {
        const response = await axios.get(tokenURI);
        this.setState({ data: [...this.state.data, response.data] });
      } catch(err) {
        console.log(err);
      }
    })
  }

  render() {
    return (
      <Row className="text-center">
        <h1 className="text-center my-5">Assets</h1>
        <Col className="d-flex justify-content-center mb-5">
          {this.state.data.map((asset, index) => {
            return (
              <Card className="mx-4" style={{ width: '24rem' }} key={index}>
                <Card.Header>
                  {asset.token_id}
                </Card.Header>
                <a href={"/harberger-taxes/asset/" + asset.token_id} rel="noopener noreferrer">
                  <Card.Img variant="top" src="/logos/dao.gif" />
                </a>
                <Card.Body>
                  <Card.Title>
                    {asset.name}
                  </Card.Title>
                  <Card.Text>
                    {asset.creator}
                  </Card.Text>
                </Card.Body>
              </Card>
            )
          })}
        </Col>
      </Row>
    )
  }
};

export default Inventory;
