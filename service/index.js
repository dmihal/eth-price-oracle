const fetch = require('node-fetch');
const contract = require('truffle-contract');
const Web3 = require('web3');

const ExchangeRateBuild = require('../build/ExchangeRate.json');

const config = require('../truffle-config');

const ExchangeRate = contract(ExchangeRateBuild);
ExchangeRate.setProvider(config.networks.kovan.provider);

const web3 = new Web3();

let storedRate = 0;
let lastUpdate = new Date(0);
function setExchangeRate(newRate) {
  console.log(`Updating price from $${storedRate} to $${newRate} (${percentDiff(storedRate, newRate)}%)`);
  storedRate = newRate;
  lastUpdate = new Date();
}
function getThreshold() {
  let timeDiff = new Date() - lastUpdate;
  return (60 * 60 * 1000) / timeDiff;
}

async function updateExchangeRate() {
  const response = await fetch('https://api.coinmarketcap.com/v1/ticker/ethereum/');
  const data = await response.json();
  const currentRate = parseFloat(data[0].price_usd);
  const timestamp = data[0].last_updated;

  const contract = await ExchangeRate.deployed();
  const [storedRateInCents, lastUpdated] = await Promise.all([
    contract.getExchangeRateInCents(),
    contract.lastUpdated();
  ]);

  const difference = percentDiff(currentRate * 100, storedRateInCents);
  const threshold = getThreshold(timestamp, lastUpdated);

  if (difference > threshold) {
    contract.setExchangeRate(timestamp);
  } else {
    console.log(`Skipping, $${currentRate} is ${difference}%, less than ${threshold}`)
  }
}

function percentDiff(a, b) {
  return Math.abs((a - b) / ((a + b) / 2)) * 100;
}

setInterval(updateExchangeRate, 60 * 1000);
updateExchangeRate();
