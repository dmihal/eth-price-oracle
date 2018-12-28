const ExchangeRate = artifacts.require('./ExchangeRate.sol');

const WEI = '1000000000000000000';

const ignoreErrors = () => null;

contract('ExchangeRate', ([owner, account1]) => {
  it("should construct the contract correctly", async () => {
    const usdExchangeRate = 360;

    const weiPerCent = web3.utils.toBN(WEI).div(web3.utils.toBN(usdExchangeRate * 100));
    
    const contract = await ExchangeRate.new(weiPerCent);

    assert.equal(await contract.getExchangeRateInUSD(), 360);
    assert.closeTo((await contract.lastUpdated()).toNumber(), (new Date()).getTime() / 1000, 1000);

    const expectedWei = weiPerCent.mul(web3.utils.toBN(1000)).toString();
    assert.equal(await contract.getValueFromDollars(10), expectedWei);
    assert.equal(await contract.getValueFromCents(1000), expectedWei);
  });

  it("should allow the owner to change the exchange rate", async () => {
    const usdExchangeRate = 360;
    const weiPerCent = web3.utils.toBN(WEI).div(web3.utils.toBN(usdExchangeRate * 100));
    
    const contract = await ExchangeRate.new(weiPerCent);
    assert.equal(await contract.getExchangeRateInUSD(), 360);

    const newExchangeRate = 300;
    const newWeiPerCent = web3.utils.toBN(WEI).div(web3.utils.toBN(newExchangeRate * 100));

    await contract.setExchangeRate(newWeiPerCent);
    assert.equal(await contract.getExchangeRateInUSD(), 300);
    assert.closeTo((await contract.lastUpdated()).toNumber(), (new Date()).getTime() / 1000, 1000);
  });

  it("should not allow other users to change the exchange rate", async () => {
    const usdExchangeRate = 360;
    const weiPerCent = web3.utils.toBN(WEI).div(web3.utils.toBN(usdExchangeRate * 100));
    
    const contract = await ExchangeRate.new(weiPerCent);
    assert.equal(await contract.getExchangeRateInUSD(), 360);

    const newExchangeRate = 300;
    const newWeiPerCent = web3.utils.toBN(WEI).div(web3.utils.toBN(newExchangeRate * 100));

    await contract.setExchangeRate(newWeiPerCent, { from: account1 }).then(() => {
      throw new Error('Should not allow exchange rate to be changed');
    }, ignoreErrors);
  });

  it("shouldn't allow changing the rate to a past price");
  it("shouldn't allow changing the rate to a future price");
});
/*
1000000000000000000

1 ETH     = 1000000000000000000 WEI     = 360 USD = 36000 cents
1/360 ETH = 1000000000000000000/360 WEI = 1 USD   = 100 cents
1/36000 ETH = 1000000000000000000/36000 WEI = 10000000000000000/360 = 1 cent

Wei/cent = 1 Wei / USDPrice / 100
Wei/cent * 100 = 1 Wei / USDPrice
Wei/cent * 100 / 1 Wei = 1 / USDPrice
1 Wei / Wei/Cent * 100 = USDPrice
*/
