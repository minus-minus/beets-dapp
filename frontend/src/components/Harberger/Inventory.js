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
    const inventory = this.state.data.sort((a, b) => (a.token_id > b.token_id) ? 1 : -1)

    return (
      <Row className="text-center mb-5">
        <h1 className="text-center my-5">Assets</h1>
        {inventory.map((asset, index) => {
          return (
            <Col className="d-flex justify-content-center mb-5" key={index}>
              <Card className="mx-3" style={{ width: '24rem' }}>
                <Card.Header>
                  {asset.token_id}
                </Card.Header>
                <a href={"/harberger-taxes/asset/" + asset.token_id} rel="noopener noreferrer">
                  <Card.Img variant="top" src={"/assets/artists/" + asset.token_id + ".jpg"} />
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
            </Col>
          )
        })}
      </Row>
    )
  }
};

export default Inventory;
