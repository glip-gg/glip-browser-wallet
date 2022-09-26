export default function HexComponent(props:any){
    
    return (
        <div style={{color:'white', overflow:'scroll'}}>
          <pre>{`${props.transactionDetails.hex}`}
          </pre>
        </div>
    )
}
