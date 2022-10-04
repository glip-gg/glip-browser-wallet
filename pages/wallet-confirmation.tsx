import { useEffect, useState} from "react";

import GlipWalletGlobal from '../services/walletService';


import WalletHeadComponent from '../components/wallet-confirmation/WalletHeadComponent';
import WalletApproveComponent from '../components/wallet-confirmation/WalletApproveComponent';
import TransactionInformationComponent from '../components/wallet-confirmation/TransactionInformationComponent';
import Loader from "../components/uiComponents/Loader";


const UserWalletConfirmationPage = (props:any) => {
    
    const [width, setWidth] = useState<number>(0);
    const [transactionDetails, setTransactionDetails] = useState<any>(null);
    const [fiatCurrency, setFiatCurrency] = useState('usd');
    
    const handleApproveClick = async () => {
        (await GlipWalletGlobal.getTransactionService()).approveTransaction();
    }

    const handleDeclineClick = async () => {
        (await GlipWalletGlobal.getTransactionService()).declineTransaction();
    }
    
    useEffect(()=>{
        (async () => {
            await GlipWalletGlobal.initFromURL()
            let newTransactionDetails = await (await GlipWalletGlobal.getTransactionService()).parseAndSetTransactionFromURI(fiatCurrency);
            setTransactionDetails(newTransactionDetails);
        })();
    },[]);
        
    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }
    
    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        handleWindowSizeChange();
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    const isMobile = width <= 768;

    if(!transactionDetails){
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgb(15,15,15)',
                height: '100%'}}>
              <Loader /></div>
        );
    }
    
    return (
        <div style={{display:'flex', flexDirection:'column',  backgroundColor:'#0F0F0F', height:'100%'}}>
          <WalletHeadComponent isMobile={isMobile}></WalletHeadComponent>
          <TransactionInformationComponent
              transactionDetails={transactionDetails}
              isMobile={isMobile}></TransactionInformationComponent>
          <WalletApproveComponent
              handleDeclineClick={handleDeclineClick}
              handleApproveClick={handleApproveClick}
            transactionDetails={transactionDetails}
              isMobile={isMobile}>
          </WalletApproveComponent>
        </div>
    );
}

export default UserWalletConfirmationPage;
