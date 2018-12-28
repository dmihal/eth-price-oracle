var ExchangeRate = artifacts.require("./ExchangeRate.sol");

module.exports = function(deployer) {
  deployer.deploy(ExchangeRate, '20000000000000');
};
