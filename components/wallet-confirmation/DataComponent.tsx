export default function DataComponent(props:any){
    return (
        <div style={{color:'white', height:'380px', overflow:'scroll'}}>
          <pre>{`
        ${JSON.stringify(props.transactionDetails.currTransaction, null, 2)}`}
          </pre>
        </div>
    )
}
