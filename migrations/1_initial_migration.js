var ExchangeRate = artifacts.require("./ExchangeRate.sol");

module.exports = function(deployer) {
  deployer.deploy(ExchangeRate, 0);
};
