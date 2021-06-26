import React, { Component } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import CurrencyInput from "react-currency-input-field";
import { Col, Jumbotron, Button } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";
import "react-datepicker/dist/react-datepicker.css";

class AssetInfo extends Component {
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
      estimatedTax: '',
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
    return (
      <Col className="d-flex justify-content-center">
        {this.state.toggleHeader ? (
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
              <p>{this.props.tokenDescription}</p>
            </div>
            <div className="text-center mt-4 mb-3">
              {!this.props.ownerAddress || (this.props.ownerAddress !== this.props.selectedAddress) ? (
                <Button
                  className="my-2 mx-3 py-2 px-4"
                  variant="danger"
                  disabled={parseFloat(this.props.assetPrice) === 0 || this.props.approvedAddress !== this.props.contractAddress} onClick={(e) => this.props.buyAsset(this.props.tokenId, this.props.assetPrice)}
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
                selected={this.state.selectedDate}
                minDate={moment().toDate()}
                onChange={(date) => this.setSelectedDate(date)}
              />
              <p className="mt-4">
                The tax price can be calculated by applying a fixed percentage of <b>{this.props.taxRatePercentage}%</b> to the current sales price. For every <b>Ξ {parseFloat(this.props.convertToEth(this.props.baseTaxPrice))}</b> that is deposited in taxes, the clock will extend for an additional <b>{this.props.baseInterval / 3600} hours</b>. You can adjust the calendar to estimate the total amount of taxes that would be due for the selected date based on the current value of this asset.
              </p>
              {this.props.assetPrice > 0 && (
                <p>
                  With a current sales price of <b>Ξ {parseFloat(this.props.convertToEth(this.props.assetPrice))}</b>, the owner of this asset must deposit a minimum amount of <b>Ξ {parseFloat(this.props.convertToEth(this.props.assetTaxAmount))}</b> in taxes before the time expires on <b>{this.formatTime(this.props.assetDeadline)}</b>
                </p>
              )}
            </div>
            <div className="text-center mt-4 mb-3">
              <form onSubmit={this.depositTax}>
                <CurrencyInput
                  prefix="Ξ "
                  decimalsLimit={4}
                  value={this.state.estimatedTax} ref={(input) => {this.deposit = input}}
                />
                <br/>
                <Button
                  className="my-3 mx-2 py-2 px-4"
                  variant="primary"
                  disabled={parseFloat(this.props.assetPrice) === 0 || (this.props.ownerAddress !== this.props.selectedAddress)} type="submit"
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

export default AssetInfo;
