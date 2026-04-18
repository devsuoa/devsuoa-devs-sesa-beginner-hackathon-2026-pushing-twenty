import React from "react"

interface TextboxProps {
    lightcol: string;
    darkcol: string;
    text: string;
    headerimage: string;
}

export default function Textbox(props: TextboxProps) {
    return (
        <div style={{ backgroundColor: "red" }}>
            {props.text}
        </div>
    )
}