import React, { useCallback, useState, useEffect, Fragment, useContext } from "react";
import "./../styles/ModalTool.scss";

interface Props {
    modalShow:Boolean;
    modalCloseFunction:Function;
    modalWidth:string;
    modalHeight:string;
    backgroundOpacity:number;
    background?:string;
    modalInnerBackground?:string;
    zIndex:number;
    children:JSX.Element;
}

const ModalTool = (props:Props) => {

    const {
        modalShow,
        modalCloseFunction,
        modalWidth,
        modalHeight,
        backgroundOpacity,
        background,
        modalInnerBackground,
        zIndex,
        children
    } = props;
    
    return (
            <div className={`modal_container ${modalShow ? "component_show" : "component_hide"}`} style={{zIndex:zIndex ? zIndex:10}}>
                <div className={`modal_inner`} 
                    style={{width:modalWidth, height:modalHeight, background:modalInnerBackground}}
                >
                    {children}
                </div>
                <div
                    className={`background`} 
                    style={{opacity:backgroundOpacity, background:background}}
                    onClick={()=>modalCloseFunction()}
                ></div>
            </div>
    );
};
export default ModalTool;
