import React from "react"

interface TextboxProps {
    lightcol: string;
    darkcol: string;
    text: string;
    headerimage: string;
}

export default function Textbox(props: TextboxProps) {
    return (
        <div style={{ backgroundColor: props.lightcol }}>
            <div>
                <img src={"/" + props.headerimage} alt={props.headerimage} />
            </div>
            <div style={{ backgroundColor: props.darkcol }}>
                <p style={{ fontFamily: "'Fira Code', Arial"}}>{props.text}</p>
            </div>
            
        </div>
    )
}