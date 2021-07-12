import React, { Component } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import CurrencyInput from "react-currency-input-field";
import { Col, Jumbotron, Button, Accordion, Card } from "react-bootstrap";
import "../../stylesheets/HarbergerAsset.css";
import "react-datepicker/dist/react-datepicker.css";

const ETHERSCAN_BASE_URI = "https://rinkeby.etherscan.io/address/";
const OPEN_SEA_BASE_URI = "https://testnets.opensea.io/";

class Marketplace extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedDate: new Date(),
      toggleHeader: true
    }

    this.calculateTax = this.calculateTax.bind(this)
    this.depositTax = this.depositTax.bind(this)
    this.formatTime = this.formatTime.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.listAsset = this.listAsset.bind(this)
  }

  handleToggle = () => {
    this.setState({
      estimatedTax: undefined,
      selectedDate: new Date(),
      toggleHeader: !this.state.toggleHeader
    })
  }

  calculateTax = (date) => {
    this.setState({ selectedDate: new Date(date) })

    const foreclosure = parseFloat(this.props.assetForeclosure)
    const baseInterval = parseFloat(this.props.baseInterval)
    const baseTaxValue = this.props.convertToEth(this.props.baseTaxValue)

    const currentTime = Math.floor(new Date() / 1000)
    const selectedTime = Math.floor(new Date(date) / 1000)

    var timeRemaining = foreclosure - currentTime
    if (timeRemaining < 0) timeRemaining = 0

    const estimatedTime = selectedTime - currentTime - timeRemaining
    var estimatedTax = (estimatedTime / baseInterval) * baseTaxValue
    if (estimatedTax < 0) estimatedTax = 0

    this.setState({ estimatedTax: estimatedTax.toFixed(4) })
  }

  listAsset = (event) => {
    event.preventDefault()
    var value = this.props.convertToWei(this.listing.value)
    value = (value === undefined) ? 0 : value
    this.props.listAsset(this.props.tokenId, value, this.props.approvedAddress)
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
    const assetForeclosure = this.props.assetForeclosure
    const assetPrice = this.props.assetPrice
    const assetTaxAmount = parseFloat(this.props.convertToEth(this.props.assetTaxAmount))
    const assetTotalDeposit = parseFloat(this.props.convertToEth(this.props.assetTotalDeposit))
    const baseTaxValue = parseFloat(this.props.convertToEth(this.props.baseTaxValue))
    const baseInterval = this.props.baseInterval
    const contractAddress = this.props.contractAddress
    const estimatedTax = this.state.estimatedTax
    const ownerAddress = this.props.ownerAddress
    const selectedAddress = this.props.selectedAddress
    const selectedBalance = parseFloat(this.props.convertToEth(this.props.selectedBalance, 2))
    const selectedDate = this.state.selectedDate
    const taxRatePercentage = this.props.taxRatePercentage
    const toggleHeader = this.state.toggleHeader
    const tokenDescription = this.props.tokenDescription
    const tokenId = this.props.tokenId

    return (
      <Col className="d-flex justify-content-center">
        {toggleHeader ? (
          <Jumbotron className="mb-5 mx-2 p-5">
            <div className="subheader justify-content-center mb-3">
              <Button
                className="toggle"
                variant="primary"
                onClick={this.handleToggle}
              >
                Tax Calculator
              </Button>
              <h4 className="text-center">
                Property Rights
              </h4>
              <Button
                className="balance"
                variant="warning"
              >
                Balance Ξ {selectedBalance}
              </Button>
            </div>
            <div className="asset-info text-center p-4">
              <p>{tokenDescription}</p>
            </div>
            <Accordion className="text-center mt-4">
              <Card>
                <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                  <b>Contract</b>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>
                    <a
                      href={ETHERSCAN_BASE_URI + contractAddress}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {this.props.minifyHash(contractAddress)}
                    </a>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
            <div className="text-center mt-4 mb-3">
              {ownerAddress !== selectedAddress && (
                <Button
                  className="my-2 mx-3 py-2 px-4"
                  variant="success"
                  disabled={parseFloat(assetPrice) === 0 || approvedAddress !== contractAddress}
                  onClick={(e) => this.props.buyAsset(tokenId, assetPrice)}
                >
                  Buy
                </Button>
              )}
              {(ownerAddress === selectedAddress && approvedAddress === contractAddress) && (
                <form onSubmit={this.listAsset}>
                  <CurrencyInput
                    prefix="Ξ "
                    decimalsLimit={4}
                    ref={(input) => {this.listing = input}}
                  />
                  <br/>
                  <Button
                    className="my-3 mx-3 py-2 px-4"
                    required={true}
                    variant="success"
                    type="submit"
                  >
                    List
                  </Button>
                </form>
              )}
              {(ownerAddress === selectedAddress && approvedAddress !== contractAddress) && (
                <Button
                  className="my-2 mx-3 py-2 px-4"
                  variant="danger"
                  title="You must first set approval for this contract before listing the asset"
                  onClick={(e) => this.props.setApproval(tokenId)}
                >
                  Approve
                </Button>
              )}
            </div>
          </Jumbotron>
        ) : (
          <Jumbotron className="p-5 mb-5 mx-2">
            <div className="subheader justify-content-center mb-3">
              <Button
                className="toggle"
                variant="success"
                onClick={this.handleToggle}
              >
                Property Rights
              </Button>
              <h4 className="text-center">
                Tax Calculator
              </h4>
              <Button
                className="balance"
                variant="warning"
              >
                Balance Ξ {selectedBalance}
              </Button>
            </div>
            <div className="asset-info text-center p-4">
              <h5>Calendar</h5>
              <DatePicker
                className="my-2"
                selected={selectedDate}
                minDate={moment().toDate()}
                onChange={(date) => this.calculateTax(date)}
              />
              <p className="mt-4">
                The tax price can be calculated by applying a fixed percentage of <b>{taxRatePercentage}%</b> to the current sales price. For every <b>{baseTaxValue} Ξ</b> that is deposited in taxes, the clock will extend for an additional <b>{baseInterval / 3600} hours</b>. You can adjust the calendar to estimate the total amount of taxes that would be due for the selected date.
              </p>
              {(assetPrice <= 0 && assetTotalDeposit <= 0) && (
                <p>
                  The current owner of this asset must first set a sales price before a foreclosure begins on:<br/> <b>{this.formatTime(assetForeclosure)}</b>
                </p>
              )}
              {(assetPrice > 0 && assetTotalDeposit <= 0) && (
                <p>
                  With a current sales price of <b>{parseFloat(this.props.convertToEth(assetPrice))} Ξ</b>, the owner of this asset must make an initial deposit of at least <b>{assetTaxAmount} Ξ</b> in taxes before a foreclosure begins on:<br/>
                  <b>{this.formatTime(assetForeclosure)}</b>
                </p>
              )}
              {(assetPrice > 0 && assetTotalDeposit > 0) && (
                <p>
                  A foreclosure on this asset is set to begin on:<br/>
                  <b>{this.formatTime(assetForeclosure)}</b>
                </p>
              )}
            </div>
            <Accordion className="text-center mt-4">
              <Card>
                <Accordion.Toggle as={Card.Header} variant="link" eventKey="1">
                  <b>Owner</b>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    <a
                      href={OPEN_SEA_BASE_URI + ownerAddress}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {this.props.minifyHash(ownerAddress)}
                    </a>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
            <div className="text-center mt-4 mb-3">
              <form onSubmit={this.depositTax}>
                <CurrencyInput
                  prefix="Ξ "
                  decimalsLimit={4}
                  value={estimatedTax}
                  ref={(input) => {this.deposit = input}}
                />
                <br/>
                <Button
                  className="my-3 mx-2 py-2 px-4"
                  variant="primary"
                  disabled={ownerAddress !== selectedAddress}
                  type="submit"
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
