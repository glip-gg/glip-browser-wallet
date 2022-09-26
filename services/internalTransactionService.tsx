import {ethers, Wallet} from "ethers";
import {TransactionRequest} from "@ethersproject/abstract-provider";
import { abiERC20, abiERC721, abiERC1155 } from '@metamask/metamask-eth-abis';
import convertToCurrency from './currencyConverterService';

import {ContractServiceFactory} from './contractServices/contractServiceFactory';
import { Socket } from 'socket.io-client';

const erc20Interface = new ethers.utils.Interface(abiERC20);
const erc721Interface = new ethers.utils.Interface(abiERC721);
const erc1155Interface = new ethers.utils.Interface(abiERC1155);


// This class represents a transaction but with the added context of the Wallet

function capitalizeFirstLetter(str:string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

type InternalTransactionServiceContructorParams = {
    signer: Wallet;
    provider: ethers.providers.JsonRpcProvider;
    connectedSocketConnection:Socket;
    isMobileSDK: boolean;
    socketUUID: string;
}

// This class handles only one transaction at a time
// currently, maybe makes sense to extend it to handle multiple transactions
// anyways cause of nonce you can only send one transaction at a time.
export class InternalTransactionService{    
    currTransaction?:TransactionRequest;
    chainId?:number;
    
    signer:Wallet;
    provider:ethers.providers.JsonRpcProvider;
    redirectURL?:string;
    connectedSocketConnection:Socket


    // Details. Set these at time of parsing transaction
    estimatedGas?:ethers.BigNumber;
    transactionCurrency?:string; // The crypto chain the transaction is on
    overviewMessage?:string;
    valueInDecimal?:number;
    valueInFiat?:number;
    totalGasInGwei?:ethers.BigNumber;
    totalGasInFiat?:number;
    fiatCurrency?:string;
    gasError?:string;
    parsedTransactionData?:any;
    // TODO: Figure out how to give this type later
    activeContractService:any;
    isMobileSDK:boolean=false;
    socketUUID?:string;
        
    constructor({signer, provider,
                 connectedSocketConnection,
                 isMobileSDK, socketUUID}:InternalTransactionServiceContructorParams){
        this.signer = signer;
        this.provider = provider;
        this.connectedSocketConnection = connectedSocketConnection;
        this.isMobileSDK = isMobileSDK;
        this.socketUUID = socketUUID;
    }
    
    parseStandardTokenTransactionData(data:any) {
        try {
            let parsedTransaction = erc20Interface.parseTransaction({ data });
            (parsedTransaction as any).interfaceType = 'ERC20';
            (parsedTransaction as any).knownContractTransaction = true;
            console.log('wow erc20');
            return parsedTransaction;
        } catch {
            // ignore and next try to parse with erc721 ABI
        }
        try {
            console.log('wow erc721');
            let parsedTransaction = erc721Interface.parseTransaction({ data });
            (parsedTransaction as any).interfaceType = 'ERC721';
            (parsedTransaction as any).knownContractTransaction = true;
            return parsedTransaction;
            
        } catch {
            // ignore and next try to parse with erc1155 ABI
        }        
        try {
            console.log('wow erc1155');
            let parsedTransaction = erc1155Interface.parseTransaction({ data });
            (parsedTransaction as any).interfaceType = 'ERC1155';
            (parsedTransaction as any).knownContractTransaction = true;
            return parsedTransaction;
        } catch {
            // ignore and return undefined
        }
        return undefined;
    }


    handleTransactionChainId(chainId:string){
        if(this.chainId && this.chainId !== parseInt(chainId)){
            throw ('Chain Id mismatch');
        }
        else if(!this.chainId){
            this.chainId = parseInt(chainId);
        }
    }

    async handleTransactionGas(){
        let parsedTransaction = (this.currTransaction as TransactionRequest);
        let gas;
        let error;
        try{
            gas = await this.signer.estimateGas(parsedTransaction);
        }
        catch(e){
            console.log('fail', e);
            error = 'Transaction likely to Fail';
        }
        this.estimatedGas = gas;
        let totalGasInWei = await this.getTotalGasInWei();
        this.totalGasInGwei = totalGasInWei?.div(1000000000);
        let currencyValue = await convertToCurrency(
            totalGasInWei,
            (await this.provider.getNetwork()).name,
            (this.fiatCurrency as string));
        this.totalGasInFiat = currencyValue;
        this.gasError = error;
    }

    async handleTransactionData(){
        let parsedTransaction = (this.currTransaction as TransactionRequest);
        let parsedData:any = (
            this.parseStandardTokenTransactionData(
                parsedTransaction.data));
        if(!parsedData){
            parsedData = {};
            parsedData.normalTransaction = true;
            parsedData.hex = '';
        }
        if(parsedData.knownContractTransaction){
            this.activeContractService = (
                ContractServiceFactory.createContractService(
                    parsedData.interfaceType,
                    (this?.currTransaction?.to as string),
                    this.provider));
        }
        this.parsedTransactionData = parsedData;
        return parsedData;
    }

    async handleTransactionValue(){
        let value = this?.currTransaction?.value;
        if(value){
            this.valueInDecimal = parseFloat(ethers.utils.formatEther(value));
            this.valueInFiat = await convertToCurrency(
                value, (this.transactionCurrency as string),
                (this.fiatCurrency as string));
            this.currTransaction!.value = ethers.BigNumber.from(value);
        }
        else{
            this.valueInDecimal = 0;
            this.valueInFiat = 0;
        }
    }

    async addOverviewMessage(){
        if(this.parsedTransactionData.normalTransaction){
            this.overviewMessage = `Transfer ${this.valueInDecimal} ${(await this.provider.getNetwork()).name} to address ${this?.currTransaction?.to}`;
        }
        else if(this.parsedTransactionData.interfaceType === 'ERC20'){
            this.overviewMessage = await this.activeContractService.getOverviewMessage(this.parsedTransactionData);
        }
        else{
            this.overviewMessage = `Could not parse transaction, please approve only if trusted`;
        }
    }
    
    async  parseAndSetTransaction(
        transactionMsg:string, lastLocation:string, chainId:string,
        fiatCurrency:string){
        let decodedTransactionString:any = '';
        this.fiatCurrency = fiatCurrency;
        this.handleTransactionChainId(chainId);
        this.redirectURL = lastLocation;
        try {
            decodedTransactionString = decodeURI(
                transactionMsg);
        } catch (e){
            throw e;
        }
        let parsedTransaction: TransactionRequest = JSON.parse(decodedTransactionString);
        this.currTransaction = parsedTransaction;
        await this.handleTransactionGas();
        await this.handleTransactionData();
        await this.handleTransactionValue();
        // Only possible to add overview message if we have parsed the data
        await this.addOverviewMessage();
        return this;
    }

    async parseAndSetTransactionFromURI(fiatCurrency:string){
        //First set transaction currency.
        console.log('network bitches', (await this.provider.getNetwork()));
        this.transactionCurrency = (await this.provider.getNetwork()).name;
        const params:any = new Proxy(new URLSearchParams(
            window.location.search), {
                get: (searchParams:any, prop:any) => searchParams.get(prop),
        });
        let signTransaction = params.signTransaction;
        let redirectURL = params.lastLocation;
        let chainId = params.chainId;
        let overviewMessage = params.overviewMessage;
        if(signTransaction){
            let transactionDetails = await this.parseAndSetTransaction(
                signTransaction, redirectURL, chainId, fiatCurrency);
            if(overviewMessage){
                transactionDetails.overviewMessage = overviewMessage;
            }
            else{
                transactionDetails.overviewMessage = "Only approve transactions from trusted parties";
            }
            return transactionDetails;
        }
        else{
            return undefined;            
        }
    }
    
    async approveTransaction(){
        // Send socket message
        console.log('approve transaction', this.currTransaction);
        let signedTransaction;
        try{
            signedTransaction = await this.signer.signTransaction(
                (this.currTransaction as TransactionRequest));
        }
        catch(e){
            return this.declineTransaction(e);
        }
        if(this.isMobileSDK){
            console.log('mobile sdk');
            (window as any).location = this.redirectURL + `?signedTransaction=${signedTransaction}&action=approve`;
        }
        else{
            console.log('sending message');
            this.connectedSocketConnection.emit("broadcast", {
                roomId: this.socketUUID,
                data: JSON.stringify({
                    signedTransaction: signedTransaction,
                    action: 'approve',
                    type: 'signedTransactionRetVal'
                }),
            });
        }
    }
    
    async declineTransaction(e?:any){
        if(this.isMobileSDK){
            window.location.href = this.redirectURL + `?action=decline`;
        }
        else if(e){
            this.connectedSocketConnection.emit("broadcast", {
                roomId: this.socketUUID,
                data: JSON.stringify({
                    action: 'decline',
                    type: 'signedTransactionRetVal',
                    errorReason: JSON.stringify(e)
                }),
            });
        }
        else{
            this.connectedSocketConnection.emit("broadcast", {
                roomId: this.socketUUID,
                data: JSON.stringify({
                    action: 'decline',
                    type: 'signedTransactionRetVal',
                    errorReason: 'Transaction declined by user'
                }),
            });
        }
    }

    async getTotalGasInWei(){
        let feeData = await this.provider.getFeeData();
        if(!this.estimatedGas){
            return ethers.BigNumber.from(0);
        }
        if(!feeData.maxFeePerGas){
            return ethers.BigNumber.from(0);
        }
        let totalGasInWei = (
            feeData?.maxFeePerGas?.mul(
                this.estimatedGas));
        return totalGasInWei;
    }

    async getTransactionCurrency(){
        if(this.transactionCurrency){
            return this.transactionCurrency;
        }
        this.transactionCurrency = (await this.provider.getNetwork()).name;
        return this.transactionCurrency;
    }
    
}
