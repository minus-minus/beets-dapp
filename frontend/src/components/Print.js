import React from "react";

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
    const {originalTokenId, trackNumber, price, priceBn, currentSupply, mintPrintLink, videoLink} = this.props;

    return (
      <div className="col-sm-6" style={{paddingTop: '10px'}}>
        <div className="card">
          <video controls playsInline src={`${videoLink}`}  />
          <div className="card-body">
            <h5 className="card-title">Track {trackNumber}</h5>
            <p className="card-text">Current supply: {currentSupply}<br/>Price: {price} ETH</p>
            <button className="btn btn-primary" onClick={() => mintPrintLink(originalTokenId, priceBn)}>Mint</button>
          </div>
        </div>
      </div>
    );
  }
}
