import React, { Component } from "react";
import moment from "moment";
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
      baseTaxPrice: this.props.convertToEth(this.props.baseTaxPrice),
      selectedDate: new Date(),
      toggleHeader: true
    }

    this.depositTax = this.depositTax.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.listAsset = this.listAsset.bind(this)
    this.setEstimatedTax = this.setEstimatedTax.bind(this)
    this.setSelectedDate = this.setSelectedDate.bind(this)
  }

  handleToggle = () => {
    this.setState({
      estimatedTax: '',
      toggleHeader: !this.state.toggleHeader
    })
  }

  listAsset = (event) => {
    event.preventDefault()
    const value = this.props.convertToWei(this.listing.value)
    this.props.listAsset(value)
  }

  setSelectedDate = (date) => {
    this.setState({ selectedDate: new Date(date) })

    this.setEstimatedTax(date)
  }

  setEstimatedTax = (date) => {
    const currentTime = Math.floor(new Date() / 1000)
    const selectedTime = Math.floor(new Date(date) / 1000)

    var timeRemaining = this.state.assetDeadline - currentTime
    if (timeRemaining < 0) timeRemaining = 0.00

    const estimatedTime = selectedTime - currentTime - timeRemaining
    var estimatedTax = (estimatedTime / this.state.baseInterval) * this.state.baseTaxPrice
    if (estimatedTax < 0) estimatedTax = 0.00

    this.setState({ estimatedTax: estimatedTax.toFixed(2) })
  }

  depositTax = (event) => {
    event.preventDefault()
    const value = this.props.convertToWei(this.deposit.value)
    this.props.depositTax(value)
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
                <Button className="my-2 mx-3 py-2 px-4" variant="danger" disabled={parseFloat(this.props.assetPrice) === 0 || this.props.approvedAddress !== this.props.contractAddress} onClick={this.props.buyAsset}>
                  Buy
                </Button>
              ) : (
                <form onSubmit={this.listAsset}>
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
              <p className="mt-4">The tax rate can be calculated by applying a fixed percentage of <b>{this.props.taxRatePercentage}%</b> to the current sales price. For every <b>Ξ {parseFloat(this.state.baseTaxPrice).toFixed(3)}</b> that is deposited in taxes, the timer will extend for an additional <b>{this.state.baseInterval / 3600 } hours</b>. You can adjust the calendar to estimate the total amount of taxes that would be due for that specified time period.</p>
            </div>
            <div className="text-center mt-4 mb-3">
              <form onSubmit={this.depositTax}>
                <CurrencyInput prefix="Ξ " decimalsLimit={4} value={this.state.estimatedTax} ref={(input) => {this.deposit = input}} /><br/>
                <Button className="my-2 mx-2 py-2 px-4" variant="primary" disabled={parseFloat(this.props.assetPrice) === 0 || (this.props.ownerAddress !== this.props.selectedAddress)} type="submit">
                  Deposit
                </Button>
              </form>
            </div>
          </Jumbotron>
        )}
      </Col>
    )
  }
};

export default AssetInfo;
