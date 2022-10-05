//Add wallet services here
import {ethers} from "ethers";
import {TransactionRequest} from "@ethersproject/abstract-provider";
import { io, Socket } from 'socket.io-client';
import {WEB_SOCKET_URI, BASE_URL,} from '../constants/constants';
import { getInternalProvider } from './internalProviderService';
import {InternalTransactionService} from './internalTransactionService';
import { v4 as uuidv4 } from 'uuid';
import { WALLET_INFO_STORAGE_KEY, USER_INFO_STORAGE_KEY, GLIP_BACKEND_TOKEN_INFO_STORAGE_KEY } from '../constants/storage_constants';


function getGlipWalletData(){
    let walletDetails:any = localStorage.getItem(
        USER_INFO_STORAGE_KEY);
    if(!walletDetails){
        return false;
    }
    walletDetails = JSON.parse(walletDetails);
    if(!walletDetails){
        return false;
    }
    return walletDetails;
}

function getGlipUserData(){
    let walletDetails:any = localStorage.getItem(
        USER_INFO_STORAGE_KEY);
    if(!walletDetails){
            return false;
    }
    walletDetails = JSON.parse(walletDetails);
    if(!walletDetails){return false;}
    return walletDetails;
}

// If number ignore
// if string convert to number
// if string hex convert hex to decimal
function convertToNumber(value:any){
    if(typeof value === 'number'){
        return value;
    }
    if(typeof value === 'string'){
        if(value.startsWith('0x')){
            return parseInt(value, 16);
        }
        return parseInt(value);
    }
    return value;
}


function isIframeWindow(){
    if(window.parent !== window){
        return true;
    }
    return false;
}
// TODO: Mixin the marketplace service inside this.
export class WalletService {
    
    chainId?:number;
    clientIdentifier?:string;
    authNetwork:any;
    connectedSocket?:Socket;
    internalTransactionService?:InternalTransactionService;
    isInitialized:boolean=false;
    isMobileSDK: boolean=false;
    socketUUID:string='';
    
    async init({
        authNetwork,
        chainId,
        clientIdentifier,
        isMobileSDK
    }:any){
        this.chainId = convertToNumber(chainId);
        this.clientIdentifier = clientIdentifier;
        this.authNetwork = authNetwork;
        this.initializeWebSocket();
        this.isInitialized = true;
        this.isMobileSDK = isMobileSDK;
        if((window as any).top){
            (window as any).top.postMessage({
                'call':'init',
                'retVal': {isInitalized:true}
            }, '*');
        }
    }

    async initFromURL(){
        const urlParams = new URLSearchParams(window.location.search);
        let chainId = convertToNumber(urlParams.get('chainId'));
        let clientIdentifier = urlParams.get('clientIdentifier');
        let isMobileSDK:boolean|string|null = urlParams.get('isMobileSDK');
        let socketUUID = urlParams.get('socketUUID');
        if(!isMobileSDK){
            isMobileSDK = false;
        }
        if(socketUUID){
            this.socketUUID = socketUUID;
        }
        else{
            this.socketUUID = '';
        }
        await this.init({
            authNetwork: '',
            chainId,
            clientIdentifier,
            isMobileSDK
        })
    }
    
    initializeWebSocket(){
        if(this.socketUUID === ''){
            return;
        }
        console.log('roomID', `${this.socketUUID}`);
        const uuid = uuidv4();
        const socket = io(WEB_SOCKET_URI, {
            transports: ['websocket'],
            query: {roomId:`${uuid}`}
        });
        this.connectedSocket = socket;
        socket.on('connect', () => {
            console.log('connected to socket');
            socket.on('message', (data: any) => {
                if(data.type === "onBidWin"){}
            });
            socket.on('data', (data) => {
            });
        });        
    }
    
       
    isConnected(){
        let loginInformation = getGlipWalletData();
        if(!loginInformation){
            // Return false
            console.log("Not connected");
            if(isIframeWindow()){
                (window as any).top.postMessage({
                    'call':'isConnected',
                    'retVal': false
                }, '*');
            }
            return false;
        }
        if(isIframeWindow()){
            (window as any).top.postMessage({
                'call':'isConnected',
                'retVal': true
            }, '*');
        }
        return true;
    }

    async getUserInfo(){
        let userData = getGlipUserData();
        if(!userData){
            if(isIframeWindow()){
                (window as any).top.postMessage({
                    'call':'getUserInfo',
                    'errorVal': 'User not logged in'
                }, '*');
            }
            return;
        }
        let returnableUserInfo = {
            'name': userData.userInfo['name'],
            'profileImage': userData.userInfo['profileImage'],
            'email': userData.userInfo['email'],
        }
        let retval = {
            'userInfo': returnableUserInfo,
            'publicAddress': userData.userInfo.publicAddress
        };
        if(isIframeWindow()){
            (window as any).top.postMessage({
                'call':'getUserInfo',
                'retVal': {
                    ...returnableUserInfo,
                    'publicAddress': userData.userInfo.publicAddress
                }
            }, '*');
        }
        return retval;
    };
    
    getSigner = (privKey:any) => {
        console.log(privKey, "privKey");
        let wallet = new ethers.Wallet(privKey)
        return wallet;
    }    
    
    async logout () {
        localStorage.clear();
        localStorage.removeItem(WALLET_INFO_STORAGE_KEY);
        localStorage.removeItem(USER_INFO_STORAGE_KEY);
        localStorage.removeItem(GLIP_BACKEND_TOKEN_INFO_STORAGE_KEY);
        localStorage.removeItem('MNEMONIC');
        localStorage.removeItem('OLD_WALLET_DETAILS');
        if(isIframeWindow()){
            (window as any).top.postMessage({
                'call':'logout',
                'retVal': true
            }, '*');
        }        
        // TODO: Remove this.
        const urlParams = new URLSearchParams(window.location.search);
        let deepLinkURL = urlParams.get('redirect_scheme');
        if(!isIframeWindow()){
            if (deepLinkURL) {
                (window as any).location = `${deepLinkURL}://loggedOut`;
            }
            else{
                (window as any).location = 'glipwallet://loggedOut'
            }
        }
    };
    
    async getGlipSigner(){
        let walletDetails:any = getGlipWalletData();
        let provider = await this.getProvider();
        let signer = this.getSigner(walletDetails.privateKey);
        return signer.connect(provider);
    }
    
    async getProvider() {
        const provider = await getInternalProvider((this.chainId as number));
        return provider;
    }

    getWalletID(){
        let glipggToken:any = localStorage.getItem(GLIP_BACKEND_TOKEN_INFO_STORAGE_KEY);
        if(!glipggToken){
            return;
        }
        glipggToken = JSON.parse(glipggToken);
        if(!glipggToken.id){
            return;
        }
        if(isIframeWindow()){
            (window as any).top.postMessage({
                'call':'getWalletID',
                'retVal': glipggToken.id
            }, '*');
        }
        return glipggToken.id
    }

    async getTransactionService(){
        if(!this.internalTransactionService){
            this.internalTransactionService = new InternalTransactionService({
                signer:await this.getGlipSigner(),
                provider:await this.getProvider(),
                connectedSocketConnection: (this.connectedSocket as Socket),
                isMobileSDK:this.isMobileSDK,
                socketUUID: this.socketUUID
            });            
        }
        return this.internalTransactionService;
    }
}

const glipWalletGlobal = new WalletService();
//(window as any).glipWalletGlobal = glipWalletGlobal;
/* 
 * window.addEventListener("message", (event) => {
 *     if(event.data.call === 'init'){
 *         if(event.data.retVal){
 *             return;
 *         }
 *         glipWalletGlobal.init(event.data.params);
 *     }
 *     else if(event.data.call === 'getUserInfo'){
 *         glipWalletGlobal.getUserInfo();
 *     }
 *     else if(event.data.call === 'getWalletID'){
 *         glipWalletGlobal.getWalletID();
 *     }
 *     else if(event.data.call === 'isConnected'){
 *         glipWalletGlobal.isConnected();
 *     }
 *     else if(event.data.call === 'logout'){
 *         glipWalletGlobal.logout();
 *     }
 * }, false);
 *  */
export default glipWalletGlobal;


