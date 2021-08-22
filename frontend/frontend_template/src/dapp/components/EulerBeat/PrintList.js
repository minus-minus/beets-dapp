import React from "react";
import { ethers } from "ethers";
import { contractAndTokenId } from "../../utils/EB/tokenInfo";
import { Print } from "./Print";
import { Container, Row } from "react-bootstrap";
import "../../stylesheets/EulerBeat.css";

export class PrintList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { printInfo: [] };
  }

  async refreshTracks() {
    const prints = [
      {
        trackNumber: '02',
        release: 'enigma',
        videoLink: 'https://storage.opensea.io/files/e2fd729eae666bc6f37eca6db2373629.mp4',
        url: 'https://eulerbeats.com/enigma/120376721408'
      },
      {
        trackNumber: '04',
        release: 'enigma',
        videoLink: 'https://storage.opensea.io/files/e982798bee8cedc77dd022f518bf24f7.mp4',
        url: 'https://eulerbeats.com/enigma/1228495585536'
      },
      {
        trackNumber: '17',
        release: 'enigma',
        videoLink: 'https://storage.opensea.io/files/71b704f856cbf830e81a5c8048de5519.mp4',
        url: 'https://eulerbeats.com/enigma/1125432951552'
      },
      {
        trackNumber: '20',
        release: 'enigma',
        videoLink: 'https://storage.opensea.io/files/5e27b5c359d46017faddd40a72edea4d.mp4',
        url: 'https://eulerbeats.com/enigma/1348636967680'
      }
    ];

    // to mint, you need
    //   originalId: string,
    //   originalOwner: string,
    //   cb
    // )
    const printInfo = [];
    for (const printNumber in prints) {
      const print = prints[printNumber]
      const { contractAddress, printTokenId, originalTokenId } = contractAndTokenId(print.release, print.trackNumber);
      const printSupply = await this.props.getTrackSupply(originalTokenId);
      const printPrice = await this.props.getTrackPrice(printSupply.add('1'));
      // console.log("price =" + printPrice.toString())
      printInfo.push({
        contractAddress,
        printTokenId,
        originalTokenId,
        price: ethers.utils.formatEther(printPrice),
        currentSupply: printSupply.toString(),
        priceBn: printPrice,
        mintPrintLink: this.props.mintPrint,
        ...print
      })
    }

    this.setState({printInfo})
  }

  async componentDidMount() {
    this.refreshTracks();
    setInterval(() => this.refreshTracks(), 3000)
  }

  render() {
    // list of print details
    const printsComponent = this.state.printInfo.map(print => {
      return <Print key={print.trackNumber} {...print} />
    })

    return (
      <Container className="my-5">
        <h1 className="text-center mb-4">Euler Beats</h1>
        <Row>
          {printsComponent}
        </Row>
      </Container>
    )
  }
}
