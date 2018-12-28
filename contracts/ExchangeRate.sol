pragma solidity ^0.4.23;

import './IEthPrice.sol';
import './Ownable.sol';
import './SafeMath.sol';

contract ExchangeRate is Ownable, IEthPrice {
  using SafeMath for uint256;

  uint256 constant ETHER_DIV_100 = 10 finney;

  uint256 private weiPerCent;
  uint256 public lastUpdated;

  constructor(uint256 _exchangeRate) public {
    require(_exchangeRate > 0);
    weiPerCent = _exchangeRate;
    lastUpdated = now;
  }

  function setExchangeRate(uint256 newExchangeRate, uint256 _lastUpdated) public onlyOwner {
    require(newExchangeRate > 0);
    require(_lastUpdated > lastUpdated && _lastUpdated < now);
    lastUpdated = _lastUpdated;
    weiPerCent = newExchangeRate;
  }

  function getExchangeRateInUSD() public view returns (uint256) {
    return ETHER_DIV_100 / weiPerCent;
  }

  function getExchangeRateInCents() public view returns (uint256) {
    return 1 ether / weiPerCent;
  }

  function getValueFromDollars(uint256 dollars) public view returns (uint256) {
    return weiPerCent.mul(dollars).mul(100);
  }

  function getValueFromCents(uint256 cents) public view returns (uint256) {
    return weiPerCent.mul(cents);
  }
}
