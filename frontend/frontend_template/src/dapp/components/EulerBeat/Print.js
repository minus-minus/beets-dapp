import React from "react";
import { Col, Card, Button } from "react-bootstrap";
import "../../stylesheets/EulerBeat.css";

export class Print extends React.Component {
  async componentDidMount() {
    Array.from(window.document.querySelectorAll('video')).map(p => new window.Plyr(p, {
      tooltips: {
        controls: true
      },
      controls: [
        'play-large', // The large play button in the center
        // 'restart', // Restart playback
        // 'rewind', // Rewind by the seek time (default 10 seconds)
        'play', // Play/pause playback
        // 'fast-forward', // Fast forward by the seek time (default 10 seconds)
        'progress', // The progress bar and scrubber for playback and buffering
        // 'current-time', // The current time of playback
        // 'duration', // The full duration of the media
        'mute', // Toggle mute
        'volume', // Volume control
        // 'captions', // Toggle captions
        // 'settings', // Settings menu
        // 'pip', // Picture-in-picture (currently Safari only)
        'airplay', // Airplay (currently Safari only)
        // 'download', // Show a download button with a link to either the current source or a custom URL you specify in your options
        'fullscreen', // Toggle fullscreen
      ]
    }));
  }

  render() {
    const {originalTokenId, trackNumber, price, priceBn, currentSupply, mintPrintLink, videoLink, url} = this.props;

    return (
      <Col md={6} className="d-flex justify-content-center p-4">
        <Card className="mb-5" style={{ width: "28rem" }}>
          <video controls playsInline src={videoLink} />
          <Card.Body className="text-center">
            <Card.Title>
              <a href={url} rel="noopener noreferrer" target="_blank">
                Track {trackNumber}
              </a>
            </Card.Title>
            <Card.Text>
              Current Supply: {currentSupply}<br/>
              Price Ξ {price}
            </Card.Text>
            <Button variant="primary" onClick={() => mintPrintLink(originalTokenId, priceBn)}>Mint</Button>
          </Card.Body>
        </Card>
      </Col>
    );
  }
}
