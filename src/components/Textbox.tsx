import React from "react"

interface TextboxProps {
    lightcol: string;
    darkcol: string;
    text: string;
    headerimage: string;
    stretch?: boolean;
}

export default function Textbox(props: TextboxProps) {
    return (
        <div
            style={{ backgroundColor: props.lightcol, boxShadow: `0 12px 0 ${props.darkcol}` }}
            className={`rounded-2xl overflow-hidden ${props.stretch ? "flex flex-col h-full" : ""}`}
        >
            <div className="flex items-center justify-center p-4">
                <img src={"/" + props.headerimage} alt={props.headerimage} className="relative h-12 w-auto object-contain" />
            </div>
            <div
                style={{ backgroundColor: props.darkcol }}
                className={`p-4 pb-12 mb-4 mx-4 rounded-lg ${props.stretch ? "flex-1" : ""}`}
            >
                <p style={{ fontFamily: "'Fira Code', monospace", color: "white", whiteSpace: "pre-wrap"}} className="text-xl">{props.text}</p>
            </div>
        </div>
    )
}
