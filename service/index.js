const fetch = require('node-fetch');
const contract = require('truffle-contract');
const Web3 = require('web3');

const ExchangeRateBuild = require('../build/contracts/ExchangeRate.json');

const config = require('../truffle-config');

const WEI = '1000000000000000000';

const ExchangeRate = contract(ExchangeRateBuild);

const providers = Object.entries(config.networks)
  .filter(([name, network]) => !network.develop)
  .map(([name, network]) => {
    const provider = network.provider();
    provider.name = name;
    return provider;
  });

const web3 = new Web3();

function getThreshold(now, lastUpdate) {
  let timeDiff = now - lastUpdate;
  return (60 * 60) / timeDiff;
}

async function updateExchangeRate() {
  const response = await fetch('https://api.coinmarketcap.com/v1/ticker/ethereum/');
  const data = await response.json();
  const currentRate = parseFloat(data[0].price_usd);
  const timestamp = data[0].last_updated;

  for (provider of providers) {
    try {
      await updateOnNetwork(provider, currentRate, timestamp);
    } catch (e) {
      console.error(`Error running update on network ${provider.name}`, e);
    }
  }
}

async function updateOnNetwork(provider, currentRate, timestamp) {
  console.log(`[${provider.name}]`)
  ExchangeRate.setProvider(provider);
  const contract = await ExchangeRate.deployed();

  const [storedRateInCents, lastUpdated] = (await Promise.all([
    contract.getExchangeRateInCents(),
    contract.lastUpdated(),
  ])).map(bn => bn.toNumber());

  const currentRateInCents = Math.round(currentRate * 100);
  const difference = percentDiff(currentRateInCents, storedRateInCents);
  const threshold = getThreshold(timestamp, lastUpdated);

  if (difference > threshold) {
    console.log(`Updating price from $${storedRateInCents / 100} to $${currentRate} (${difference}%)`);
    const newWeiPerCent = web3.utils.toBN(WEI).div(web3.utils.toBN(currentRateInCents));

    const owner = await contract.owner();
    const { receipt } = await contract.setExchangeRate(newWeiPerCent, timestamp, { from: owner });
    console.log(`TX ${receipt.transactionHash} (block ${receipt.blockNumber})`);
  } else {
    console.log(`Skipping, $${currentRate} is ${difference}%, less than ${threshold}`)
  }
}

function percentDiff(a, b) {
  const _a = web3.utils.toBN(a);
  const _b = web3.utils.toBN(b);
  const commonDenominator = web3.utils.toBN(10);

  const top = _a.sub(_b).div(commonDenominator).toNumber();
  const bottom = _a.add(_b).div(web3.utils.toBN(2)).div(commonDenominator).toNumber();
  return Math.abs(top / bottom) * 100;
}

setInterval(updateExchangeRate, 60 * 1000);
updateExchangeRate();
