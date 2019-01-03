pragma solidity ^0.4.23;

import './IEthPrice.sol';
import './Ownable.sol';
import './SafeMath.sol';

contract ExchangeRate is Ownable, IEthPrice {
  using SafeMath for uint256;

  uint256 constant ETHER_DIV_100 = 10 finney;

  uint256 private weiPerCent;
  uint256 private lastUpdatedTimestamp;

  address private delegate;

  constructor(uint256 _exchangeRate) public {
    require(_exchangeRate > 0);
    weiPerCent = _exchangeRate;
    lastUpdatedTimestamp = now;
  }

  function setExchangeRate(uint256 newExchangeRate, uint256 _lastUpdated) public onlyOwner {
    require(newExchangeRate > 0);
    require(_lastUpdated > lastUpdatedTimestamp && _lastUpdated <= now);
    lastUpdatedTimestamp = _lastUpdated;
    weiPerCent = newExchangeRate;
  }

  function getExchangeRateInUSD() public view returns (uint256) {
    return ((1 ether / getWeiPerCent()) + 50) / 100;
  }

  function getExchangeRateInCents() public view returns (uint256) {
    return 1 ether / getWeiPerCent();
  }

  function getValueFromDollars(uint256 dollars) public view returns (uint256) {
    return getWeiPerCent().mul(dollars).mul(100);
  }

  function getValueFromCents(uint256 cents) public view returns (uint256) {
    return getWeiPerCent().mul(cents);
  }

  function lastUpdated() public view returns (uint256) {
    if (delegate == address(0)) {
      return lastUpdatedTimestamp;
    }
    return ExchangeRate(delegate).lastUpdated();
  }

  function() public payable {}

  function withdraw() public onlyOwner {
    owner().transfer(address(this).balance);
  }

  function setDelegate(address newDelegate) public onlyOwner {
    delegate = newDelegate;
  }

  function getWeiPerCent() private view returns (uint256) {
    if (delegate == address(0)) {
      return weiPerCent;
    }
    return ExchangeRate(delegate).getValueFromCents(1);
  }

}
