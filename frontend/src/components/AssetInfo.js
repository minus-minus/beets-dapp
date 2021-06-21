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
      assetDeadline: parseFloat(this.props.assetDeadline),
      baseInterval: parseFloat(this.props.baseInterval),
      baseTaxPrice: 0.01,
      selectedDate: Date.now(),
      toggleHeader: true
    }

    this.formatDate = this.formatDate.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.setEstimatedTax = this.setEstimatedTax.bind(this)
    this.setSelectedDate = this.setSelectedDate.bind(this)
  }

  handleToggle = () => {
    this.setState({ toggleHeader: !this.state.toggleHeader })
  }

  setSelectedDate = (date) => {
    this.setState({
      currentUnixTime: Math.floor(Date.now() / 1000),
      selectedDate: new Date(date),
      selectedUnixTime: Math.floor(new Date(date) / 1000),
      estimatedTax: this.setEstimatedTax()
    })
  }

  setEstimatedTax = () => {
    var timeRemaining = this.state.assetDeadline - this.state.currentUnixTime
    console.log("Time Remaining:", timeRemaining)
    if (timeRemaining < 0) timeRemaining = 0

    const estimatedTime = this.state.selectedUnixTime - this.state.currentUnixTime + timeRemaining
    console.log("Estimated Time:", estimatedTime)

    const estimatedTax = (estimatedTime / this.state.baseInterval) * this.state.baseTaxPrice
    console.log("Estimated Tax:", estimatedTax)

    return estimatedTax.toFixed(2)
  }

  formatDate = (unixTime) => {
    if (!unixTime) return
    const localtz = moment.tz.guess()
    return moment.unix(unixTime).tz(localtz)
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
              <DatePicker className="my-2" selected={this.state.selectedDate} minDate={moment().toDate()} onChange={(date) => this.setSelectedDate(date)} />
              <p className="mt-4">The tax rate can be calculated by applying a fixed percentage of <b>{this.props.taxRatePercentage}%</b> to the current sales price. For every <b>0.01 Ξ</b> that is deposited in taxes, the timer will extend for an additional 12 hours. You can adjust the calendar to estimate the total amount of taxes that would be due for that specified time period.</p>
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
