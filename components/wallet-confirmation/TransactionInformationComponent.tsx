import { useEffect, useState} from "react";
import {TabsComponent} from '../uiComponents/TabComponent';
import DetailsComponent from './DetailsComponent';
import DataComponent from './DataComponent';
import HexComponent from './HexComponent';

import styled from 'styled-components';

const labelTextSpanStyle = {
    fontFamily: 'Chakra Petch',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: '21px',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    color: '#FFFFFF'
} as React.CSSProperties;


const TransactionOverviewDiv = styled.div`
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    margin-top: 20px;
`;

const TransactionOverviewHeaderTextSpan = styled.span`
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 125%;
    text-align: center;
    letter-spacing: 0.1px;
    color: #FFFFFF;
`;

const TransactionOverviewTextSpan = styled.span`
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    color: #FFFFFF;
    margin-top: 20px;
    padding: 0 20px;
`;

function capitalizeFirstChar(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const TransactionInformationComponent = (props:any) => {
    console.log('props.transactionDetails', props.transactionDetails);
    return (
        <>
          <TransactionOverviewDiv>
            <TransactionOverviewHeaderTextSpan>
              Transaction Overview
            </TransactionOverviewHeaderTextSpan>
            <TransactionOverviewTextSpan>
              {props.transactionDetails?.overviewMessage}
            </TransactionOverviewTextSpan>
          </TransactionOverviewDiv>
          <TabsComponent>
            <div data-label={"Details"}>
              <DetailsComponent transactionDetails={props.transactionDetails}/>
            </div>
            <div data-label="Data">
              <DataComponent transactionDetails={props.transactionDetails} />
            </div>
            <div data-label="Hex">
              <HexComponent transactionDetails={props.transactionDetails} />
            </div>
          </TabsComponent>
        </>
    );

}

export default TransactionInformationComponent;
