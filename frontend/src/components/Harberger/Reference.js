import React, { Component } from "react";
import { Row, Col, Card } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";

class Reference extends Component {
  render() {
    return (
      <Row>
        <h1 className="text-center my-5">References</h1>
        <Col className="d-flex justify-content-center mb-5">
          <Card style={{ width: '24rem' }}>
            <a href="https://yos.io/2018/11/18/harberger-taxes/" rel="noopener noreferrer" target="_blank">
              <Card.Img variant="top" src="/harberger.jpeg" />
            </a>
            <Card.Body>
              <Card.Title>Harberger Taxes on Ethereum</Card.Title>
              <Card.Text>
                Harberger Taxes is an economic abstraction that aims to democratize the control of assets between private and common ownership. In this taxation system, asset owners self-assess...
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="d-flex justify-content-center mb-5">
          <Card style={{ width: '24rem' }}>
            <a href="https://podcasts.apple.com/gb/podcast/ep-22-nft-bonding-curves-harberger-taxes-w-simon-la/id1492490959?i=1000489290198" rel="noopener noreferrer" target="_blank">
              <Card.Img variant="top" src="/podcast.jpeg" />
            </a>
            <Card.Body>
              <Card.Text>
                <iframe
                  title="Economics Design"
                  allow="autoplay *; encrypted-media *; fullscreen *"
                  frameBorder="0"
                  height="175"
                  style={{width: "100%"}}
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                  src="https://embed.podcasts.apple.com/gb/podcast/ep-22-nft-bonding-curves-harberger-taxes-w-simon-la/id1492490959?i=1000489290198"
                >
                </iframe>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="d-flex justify-content-center mb-5">
          <Card style={{ width: '24rem' }}>
            <a href="https://thisartworkisalwaysonsale.com/" rel="noopener noreferrer" target="_blank">
              <Card.Img variant="top" src="/artwork.png" />
            </a>
            <Card.Body>
              <Card.Title>This Artwork Is Always On Sale</Card.Title>
              <Card.Text>
                Using the Ethereum blockchain, it is possible to introduce scarcity of ownership alongside novel economic and property rights. Inspired by Radical Markets, this artwork follows a modified Harberger Tax property ownership where...
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    )
  }
}

export default Reference;
