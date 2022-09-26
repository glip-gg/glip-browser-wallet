//This is a react component to show the details of a single transaction on web3 wallet.
import {useEffect, useState} from 'react';
import CroakAuthGlobal from '../../services/walletService';

import styled from 'styled-components';


const DetailContainerDiv = styled.div`
`;

const DetailItemDiv = styled.div`
    border-bottom: 0.5px solid #1C1F33;
    border-top: 0.5px solid #1C1F33;
    height: 48px;
    padding: 16px;
`;


const DetailItemRowDiv = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    height: 100%;
`;

const DetailSubTitleSpan = styled.span`
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    text-align: right;
    color: #7A7F9E;
`

export default function DetailsComponent(props:any){
    //Return the transaction details.
    const [currency, setCurrency] = useState('');


    useEffect(() => {
        (async () => {
            let currency = await props.transactionDetails.getTransactionCurrency()
            setCurrency(currency);
        })();
    }, []);
    

    const getTotal = (value:number, gas:number) => {
        let tempGas = gas;
        let tempVal = value;
        if(!gas){
            tempGas = 0;
        }
        if(!value){
            tempVal = 0;
        }
        return tempVal + tempGas;
    }
    
    
    return (
        <DetailContainerDiv>
          <DetailItemDiv>
            <DetailItemRowDiv>
              <div>Cost</div>
              <div style={{textTransform: "uppercase"}}>{props.transactionDetails.valueInDecimal} {currency} ({props.transactionDetails.valueInFiat.toFixed(2)} {props.transactionDetails.fiatCurrency})</div>
            </DetailItemRowDiv>
          </DetailItemDiv>
          <DetailItemDiv>
            <DetailItemRowDiv>
              <div>Estimated Gas</div>
              {/*
                  <div>{getNumber(props.transactionDetails.gasLimit)}</div>*/
              }
              <div style={{textTransform: "uppercase"}}>
                <div>{props.transactionDetails.totalGasInGwei.toNumber()} Gwei ({props.transactionDetails.totalGasInFiat.toFixed(5)} {props.transactionDetails.fiatCurrency})</div>
              </div>
            </DetailItemRowDiv>
          </DetailItemDiv>
          <DetailItemDiv>
            <DetailItemRowDiv>
              <div>Total</div>
              <div style={{textTransform: "uppercase"}}>{getTotal(
                      props.transactionDetails.valueInDecimal,
                      props.gasValueInDollar).toFixed(4)} USD</div>
            </DetailItemRowDiv>
          </DetailItemDiv>
        </DetailContainerDiv>
    );
    
}
