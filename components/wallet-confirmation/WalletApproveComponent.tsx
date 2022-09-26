import { useEffect, useState} from "react";


const approveButtonStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    height: '44px',
    width: '135px',
    background: 'linear-gradient(90.07deg, #3999F9 29.06%, #4A7DFF 96.96%)',
    borderRadius: '12px',
    marginLeft:16,
    cursor: 'pointer'
} as React.CSSProperties;

const declineButtonStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    height: '44px',
    background: '#0F0F0F',
    borderRadius: '12px',
    width: '135px',
    marginLeft:'10px',
    cursor: 'pointer'
} as React.CSSProperties;

const approveContainerOuterStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position:'absolute',
    bottom: 0,
    width:'100%',
    background: '#26283E',
    height: '120px'
} as React.CSSProperties;

const approveContainerInnerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#26283E',
    height: '120px'
} as React.CSSProperties;

const textSpanStyle = {
    color: 'white'
}
const WalletApproveComponent = (props:any) => {
    
    const handleDeclineClick = () => {
        props.handleDeclineClick();
        //GlipAuthGlobal.declineCurrentWalletRequest();
    }
    
    const handleApproveClick = () => {
        props.handleApproveClick();
        //GlipAuthGlobal.approveCurrentWalletRequest();
    }
    
    return (
        <>
          <div style={approveContainerOuterStyle}>
            {(props.transactionDetails.gasError) && (
                <div style={{color:"red", marginTop:10}}>
                  *This transaction is likely to fail.
                </div>
            )}
            <div style={approveContainerInnerStyle}>
                  <div onClick={()=>{handleDeclineClick()}}
                       style={declineButtonStyle}>
                    <span style={textSpanStyle}>Decline</span>
                  </div>
                  <div onClick={()=>{handleApproveClick()}}
                       style={approveButtonStyle}>
                    <span style={textSpanStyle}>Approve</span>
                  </div>
            </div>
          </div>
        </>
    );

}

export default WalletApproveComponent;
