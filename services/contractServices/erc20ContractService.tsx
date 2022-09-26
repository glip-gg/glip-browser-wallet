import {ethers} from "ethers";
import { abiERC20 } from '@metamask/metamask-eth-abis';

function capitalizeFirstLetter(str:string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Providing a helper layer above contracts
// to make it easier to interact with them
export class ERC20ContractService{
    contract: ethers.Contract;
    address:string;
    provider: ethers.providers.JsonRpcProvider;
    
    constructor(
        address:string,
        provider: ethers.providers.JsonRpcProvider){
        this.address = address;
        this.provider = provider;
        this.contract = new ethers.Contract(
            address, abiERC20, provider);
    }
    
    async getOverviewMessage(parsedTransactionData: any) {
        let tokenName = await this.contract.name();
        if(parsedTransactionData.name === 'transfer'){
            let transferUnitInDecimal = ethers.utils.formatEther(
                ethers.BigNumber.from(parsedTransactionData.args[1]));
            return `${capitalizeFirstLetter(parsedTransactionData.name)} ${transferUnitInDecimal} ${tokenName} to ${parsedTransactionData.args[0]}`;
        }
        if(parsedTransactionData.name === 'approve'){
            let transferUnitInDecimal = ethers.utils.formatEther(
                ethers.BigNumber.from(parsedTransactionData.args[1]));
            return `${capitalizeFirstLetter(parsedTransactionData.name)} ${parsedTransactionData.args[0]} to transfer ${transferUnitInDecimal} ${tokenName} to any address`;
        }
        if(parsedTransactionData.name === 'transferFrom'){
            let transferUnitInDecimal = ethers.utils.formatEther(
                ethers.BigNumber.from(parsedTransactionData.args[2]));
            return `Transfer ${parsedTransactionData.args[0]}'s ${transferUnitInDecimal} ${tokenName} from  to ${parsedTransactionData.args[1]}`;
        }
        else{
            return `Unable to detect method. Please only approve if you are sure of the transaction.`;
        }
    }
    
}
