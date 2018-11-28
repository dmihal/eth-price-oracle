const fetch = require('node-fetch');

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
  console.log('=== Starting update-exchange-rate ===');

  const response = await fetch('https://api.coinmarketcap.com/v1/ticker/ethereum/');
  const data = await response.json();
  const currentRate = parseFloat(data[0].price_usd);

  const difference = percentDiff(currentRate, storedRate);
  const threshold = getThreshold();

  if (difference > threshold) {
    setExchangeRate(currentRate);
  } else {
    console.log(`Skipping, $${currentRate} is ${difference}%, less than ${threshold}`)
  }
}

function percentDiff(a, b) {
  return Math.abs((a - b) / ((a + b) / 2)) * 100;
}

setInterval(updateExchangeRate, 60 * 1000);
updateExchangeRate();
