pragma solidity ^0.4.24;

interface IEthPrice {
  function getExchangeRateInUSD() public view returns (uint256);
  function getExchangeRateInCents() public view returns (uint256);
  function getValueFromDollars(uint256 dollars) public view returns (uint256);
  function getValueFromCents(uint256 cents) public view returns (uint256);
}
