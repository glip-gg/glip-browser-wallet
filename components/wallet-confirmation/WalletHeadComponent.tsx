import { useEffect, useState} from "react";
import GlipLogo from '../../styles/assets/glip_logo.svg';
import Image from 'next/image'

import styled from 'styled-components';


const GlipWalletHeaderDiv = styled.div`
    display: flex;
    align-items: center;
    flex-direction: row;
    background: #26283E;
    height: 50px;
    padding: 8px;
`;

const GlipHeaderTextSpan = styled.span`    
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 125%;
    text-align: left;
    letter-spacing: 0.1px;
    color: #FFFFFF;
`

const WalletHeadComponent = (props:any) => {
    
    return (
        <GlipWalletHeaderDiv>
          <div>
            <Image style={{marginRight:10,
                           marginLeft:10}}
                   src="/glip_logo.svg" alt="me" height="23" width="23" />
          </div>
          <GlipHeaderTextSpan>
            Glip Wallet
          </GlipHeaderTextSpan>
        </GlipWalletHeaderDiv>);
    
}

export default WalletHeadComponent;

