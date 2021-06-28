import React, { Component } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import CurrencyInput from "react-currency-input-field";
import { Col, Jumbotron, Button } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";
import "react-datepicker/dist/react-datepicker.css";

class Marketplace extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedDate: new Date(),
      toggleHeader: true
    }

    this.depositTax = this.depositTax.bind(this)
    this.formatTime = this.formatTime.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.listAsset = this.listAsset.bind(this)
    this.setEstimatedTax = this.setEstimatedTax.bind(this)
    this.setSelectedDate = this.setSelectedDate.bind(this)
  }

  handleToggle = () => {
    this.setState({
      estimatedTax: undefined,
      toggleHeader: !this.state.toggleHeader
    })
  }

  listAsset = (event) => {
    event.preventDefault()
    const value = this.props.convertToWei(this.listing.value)
    this.props.listAsset(this.props.tokenId, value, this.props.approvedAddress)
  }

  setSelectedDate = (date) => {
    this.setState({ selectedDate: new Date(date) })

    this.setEstimatedTax(date)
  }

  setEstimatedTax = (date) => {
    const deadline = parseFloat(this.props.assetDeadline)
    const baseInterval = parseFloat(this.props.baseInterval)
    const baseTaxPrice = this.props.convertToEth(this.props.baseTaxPrice)

    const currentTime = Math.floor(new Date() / 1000)
    const selectedTime = Math.floor(new Date(date) / 1000)

    var timeRemaining = deadline - currentTime
    if (timeRemaining < 0) timeRemaining = 0.00

    const estimatedTime = selectedTime - currentTime - timeRemaining
    var estimatedTax = (estimatedTime / baseInterval) * baseTaxPrice
    if (estimatedTax < 0) estimatedTax = 0.00

    this.setState({ estimatedTax: estimatedTax.toFixed(2) })
  }

  depositTax = (event) => {
    event.preventDefault()
    const value = this.props.convertToWei(this.deposit.value)
    this.props.depositTax(this.props.tokenId, value)
  }

  formatTime = (unixTime) => {
    if (!unixTime) return
    const localtz = moment.tz.guess()
    return moment.unix(unixTime).tz(localtz).format('MMMM Do YYYY [@] h:mm a')
  }

  render() {
    const approvedAddress = this.props.approvedAddress
    const assetDeadline = this.props.assetDeadline
    const assetPrice = this.props.assetPrice
    const assetTaxAmount = parseFloat(this.props.convertToEth(this.props.assetTaxAmount))
    const baseTaxPrice = parseFloat(this.props.convertToEth(this.props.baseTaxPrice))
    const baseInterval = this.props.baseInterval
    const contractAddress = this.props.contractAddress
    const estimatedTax = this.state.estimatedTax
    const ownerAddress = this.props.ownerAddress
    const selectedAddress = this.props.selectedAddress
    const selectedDate = this.state.selectedDate
    const taxRatePercentage = this.props.taxRatePercentage
    const toggleHeader = this.state.toggleHeader
    const tokenDescription = this.props.tokenDescription
    const tokenId = this.props.tokenId

    return (
      <Col className="d-flex justify-content-center">
        {toggleHeader ? (
          <Jumbotron className="p-5 mb-5 mx-2">
            <div className="text-center mb-3">
              <Button
                className="subheader"
                variant="success"
                onClick={this.handleToggle}
              >
                How It Works
              </Button>
            </div>
            <div className="asset-info text-center p-4">
              <p>{tokenDescription}</p>
            </div>
            <div className="text-center mt-4 mb-3">
              {!ownerAddress || (ownerAddress !== selectedAddress) ? (
                <Button
                  className="my-2 mx-3 py-2 px-4"
                  variant="danger"
                  disabled={parseFloat(assetPrice) === 0 || approvedAddress !== contractAddress} onClick={(e) => this.props.buyAsset(tokenId, assetPrice)}
                >
                  Buy
                </Button>
              ) : (
                <form onSubmit={this.listAsset}>
                  <CurrencyInput prefix="Ξ " decimalsLimit={4} ref={(input) => {this.listing = input}}/><br/>
                  <Button
                    className="my-3 mx-3 py-2 px-4"
                    variant="success"
                    type="submit"
                  >
                    List
                  </Button>
                </form>
              )}
            </div>
          </Jumbotron>
        ) : (
          <Jumbotron className="p-5 mb-5 mx-2">
            <div className="text-center mb-3">
              <Button
                className="subheader"
                variant="primary"
                onClick={this.handleToggle}
              >
                Estimate Tax
              </Button>
            </div>
            <div className="asset-info text-center p-4">
              <h5>Calendar</h5>
              <DatePicker
                className="my-2"
                selected={selectedDate}
                minDate={moment().toDate()}
                onChange={(date) => this.setSelectedDate(date)}
              />
              <p className="mt-4">
                The tax price can be calculated by applying a fixed percentage of <b>{taxRatePercentage}%</b> to the current sales price. For every <b>{baseTaxPrice} Ξ</b> that is deposited in taxes, the clock will extend for an additional <b>{baseInterval / 3600} hours</b>. You can adjust the calendar to estimate the total amount of taxes that would be due for the selected date.
              </p>
              {assetPrice > 0 && (
                <p>
                  With a current sales price of <b>{parseFloat(this.props.convertToEth(assetPrice))} Ξ</b>, the owner of this asset must deposit a minimum amount of <b>{assetTaxAmount} Ξ</b> in taxes before the time expires on <b>{this.formatTime(assetDeadline)}</b>
                </p>
              )}
            </div>
            <div className="text-center mt-4 mb-3">
              <form onSubmit={this.depositTax}>
                <CurrencyInput
                  prefix="Ξ "
                  decimalsLimit={4}
                  value={estimatedTax} ref={(input) => {this.deposit = input}}
                />
                <br/>
                <Button
                  className="my-3 mx-2 py-2 px-4"
                  variant="primary"
                  disabled={parseFloat(assetPrice) === 0 || (ownerAddress !== selectedAddress)} type="submit"
                >
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

export default Marketplace;
