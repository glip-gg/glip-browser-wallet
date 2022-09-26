const labelTextSpanStyle = {
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '18px',
    textAlign: 'center',
    letterSpacing: '0.2px',
} as React.CSSProperties;


function TabComponent(props:any) {
    const onClick = () => {
        props.onClick(props.label);
    };
    
    let className = "tab-list-item";

    if (props.activeTab === props.label) {
        className += " tab-list-active";
    }

    return (
        <li className={className} style={labelTextSpanStyle} onClick={onClick}>
            {props.label}
        </li>
    );
}


export { TabComponent };
