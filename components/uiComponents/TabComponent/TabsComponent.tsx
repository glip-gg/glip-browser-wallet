import { useState } from "react";
import {TabComponent} from "./TabComponent";


function TabsComponent(props:any) {

    const [activeTab, setActiveTab] = useState(props.children[0].props['data-label']);
    
    const onClickTabItem = (tab:any) => {
        setActiveTab(tab)
    };

    return (
        <div style={{margin:16}} className="tabs">
            <ol className="tab-list">
                {props.children.map((child:any) => {
                    const label = child.props['data-label'];
                    
                    return (
                        <TabComponent
                            activeTab={activeTab}
                            key={label}
                            label={label}
                            onClick={onClickTabItem}
                        />
                    );
                })}
            </ol>
            <div className="tab-content">
                {props.children.map((child:any) => {
                    if (child.props['data-label'] !== activeTab) return undefined;
                    return child.props.children;
                })}
            </div>
        </div>
    );
}

export {TabsComponent};
