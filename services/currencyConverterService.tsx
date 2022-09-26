import {ethers} from "ethers";

// @ts-ignore
import CoinGecko from 'coingecko-api';
const CoinGeckoClient = new CoinGecko();

const coinGeckoSymbolIdDict: { [id: string] : string; } = {
    "eth": "ethereum",
    "matic": "matic-network",
    "axs": "axie-infinity",
    "slp": "smooth-love-potion",
    "usdc": "usd-coin",
}

async function convertToCurrency(
    weiValue:any, inputCurrencyName:string, outputCurrencyName:string){
    console.log('convertToCurrency', weiValue, inputCurrencyName, outputCurrencyName);
    if (!coinGeckoSymbolIdDict[inputCurrencyName]){
        return 0;
    }
    const data = await CoinGeckoClient.simple.price({
        ids: [coinGeckoSymbolIdDict[inputCurrencyName]],
        vs_currencies: [ outputCurrencyName ]
    });
    let ethValue = ethers.utils.formatEther(weiValue);
    let dollarPrice = data.data['matic-network']['usd'];
    let finalValue = dollarPrice * Number(ethValue);
    console.log("finalValue", finalValue);
    return finalValue;
}

export default convertToCurrency;
