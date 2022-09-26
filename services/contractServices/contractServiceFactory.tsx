import {ethers} from "ethers";
import {ERC20ContractService} from './erc20ContractService';


export class ContractServiceFactory{
    
    public static createContractService(
        contractType:string, contractAddress:string,
        provider:ethers.providers.JsonRpcProvider
    ) {
        if(contractType === 'ERC20')
            return new ERC20ContractService(
                contractAddress, provider);
    }
}
