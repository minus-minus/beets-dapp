import React, { Component } from "react";
import moment from "moment";
import "moment-timezone";
import DatePicker from "react-datepicker";
import CurrencyInput from "react-currency-input-field";
import { Col, Jumbotron, Button } from "react-bootstrap";
import "../stylesheets/HarbergerAsset.css";
import "react-datepicker/dist/react-datepicker.css";

class AssetInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      toggleHeader: true
    }

    this.handleToggle = this.handleToggle.bind(this)
    this.formatTime = this.formatTime.bind(this)
  }

  handleToggle = () => {
    this.setState({ toggleHeader: !this.state.toggleHeader })
  }

  formatTime = (unixTime) => {
    if (!unixTime) return

    const localtz = moment.tz.guess()
    return moment.unix(unixTime).tz(localtz).format('MMMM Do YYYY, h:mm:ss a z')
  }

  render() {
    return (
      <Col className="d-flex justify-content-center">
        {this.state.toggleHeader ? (
          <Jumbotron className="p-5 mb-5 mx-2">
            <div className="text-center mb-3">
              <Button className="subheader" variant="success" onClick={this.handleToggle}>
                How It Works
              </Button>
            </div>
            <div className="asset-info text-center p-4">
              <p>Welcome to the land where smart contracts get intertwined in the crosshairs of economics. The Harberger Tax song is <b>ALWAYS</b> on sale. The owner of this asset <b>MUST</b> set a sales price while also paying the corresponding tax rate over a given period of time.</p>
              <p>The higher the sales price, the higher the amount in taxes that must be deposited in order to extend the timer. If either of these conditions is failed to be met once the timer runs out, the creator of this NFT has the ability to reclaim their rightful asset.</p>
            </div>
            <div className="text-center mt-4 mb-3">
              {!this.props.ownerAddress || (this.props.ownerAddress !== this.props.selectedAddress) ? (
                <Button className="my-2 mx-3 py-2 px-4" variant="danger" disabled={parseFloat(this.props.assetPrice) === 0} onClick={this.props.buyAsset}>
                  Buy
                </Button>
              ) : (
                <form onSubmit={(e) => {
                    e.preventDefault()
                    this.props.listAsset(this.props.convertToWei(this.listing.value))
                  }}>
                  <CurrencyInput prefix="Ξ " decimalsLimit={4} ref={(input) => {this.listing = input}}/><br/>
                  <Button className="my-2 mx-3 py-2 px-4" variant="success" type="submit">
                    List
                  </Button>
                </form>
              )}
            </div>
          </Jumbotron>
        ) : (
          <Jumbotron className="p-5 mb-5 mx-2">
            <div className="text-center mb-3">
              <Button className="subheader" variant="primary" onClick={this.handleToggle}>
                Estimate Tax
              </Button>
            </div>
            <div className="asset-info text-center p-4">
              <h5>Calendar</h5>
              <DatePicker className="my-2" />
              <p className="mt-4">The tax rate can be calculated by applying a fixed percentage of {this.props.taxRatePercentage}% to the current sales price. For every 0.01Ξ that is deposited in taxes, the timer will extend for an additional 12 hours. You can adjust the calendar to estimate the total amount of taxes that would be due for that specified time period.</p>
            </div>
            <div className="text-center mt-4 mb-3">
              {!this.props.ownerAddress || (this.props.ownerAddress !== this.props.selectedAddress) ? (
                <Button className="my-2 mx-3 py-2 px-4" variant="danger" disabled={parseFloat(this.props.assetPrice) === 0} onClick={this.props.buyAsset}>
                  Buy
                </Button>
              ) : (
                <form onSubmit={(e) => {
                    e.preventDefault()
                    this.props.depositTax(this.props.convertToWei(this.deposit.value))
                  }}>
                  <CurrencyInput prefix="Ξ " decimalsLimit={4} ref={(input) => {this.deposit = input}}/><br/>
                  <Button className="my-2 mx-2 py-2 px-4" variant="primary" type="submit">
                    Deposit
                  </Button>
                </form>
              )}
            </div>
          </Jumbotron>
        )}
      </Col>
    )
  }
};

export default AssetInfo;
