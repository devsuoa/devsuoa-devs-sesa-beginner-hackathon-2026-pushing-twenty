import { useState, useEffect, useRef } from "react";
import { loadPyodide, type PyodideInterface } from "pyodide";

interface CodeboxProps {
  lightcol: string;
  darkcol: string;
  headerimage: string;
  onOutput: (output: string) => void;
}

export default function Codebox(props: CodeboxProps) {

    const [code, setCode] = useState("");

    ////////
    const [isRunning, setIsRunning] = useState(false);
    const [pyodideReady, setPyodideReady] = useState(false);

    // Store the Pyodide instance so we only load it once
    const pyodideRef = useRef<PyodideInterface | null>(null);

    // ←←← LOAD PYODIDE ONLY ONCE ←←←
    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
        try {
            const pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/",
            });

            if (mounted) {
            pyodideRef.current = pyodide;
            setPyodideReady(true);
            }
        } catch (err) {
            console.error("Failed to load Pyodide", err);
            props.onOutput?.("Failed to load Python runtime 😢");
        }
        };

        initialize();

        return () => {
        mounted = false;
        };
    }, [props.onOutput]);

    const runCode = async () => {
        const pyodide = pyodideRef.current;
        if (!pyodide) {
        props.onOutput?.("Python runtime is still loading...");
        return;
        }

        setIsRunning(true);
        let output = "";

        try {
        // Capture print() output
        pyodide.setStdout({
            batched: (msg: string) => {
            output += msg + "\n";
            },
        });

        const result = await pyodide.runPythonAsync(code);

        const fullOutput =
            output.trim() +
            (result !== undefined ? "\n" + String(result) : "");

        props.onOutput?.(fullOutput || "Code executed successfully (no output)");
        } catch (err: any) {
        props.onOutput?.(`Error: ${err.message}`);
        console.error(err);
        } finally {
        setIsRunning(false);
        }
    };
    ////////

    return (
        <div style={{ backgroundColor: props.lightcol, boxShadow: `0 12px 0 ${props.darkcol}` }} className={`rounded-2xl overflow-hidden flex flex-col mt-25`}>
            <div className="flex items-center justify-center p-4">
                <img src={"/" + props.headerimage} alt={props.headerimage} className="relative h-12 w-auto object-contain" />
            </div>

            <textarea style={{ fontFamily: "'Fira Code', monospace", color: "white", backgroundColor: props.darkcol}} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Write code here!" 
                className="p-6 text-2xl mx-4 rounded-lg resize-none min-h-[300px]"></textarea>

            <div className="m-4 mx-4 h-14">
                <button
                onClick={runCode}
                disabled={!pyodideReady || isRunning}
                style={{ backgroundColor: "#00A93D", boxShadow: `0 6px 0 #00531F`, opacity: !pyodideReady || isRunning ? 0.7 : 1}}
                className="rounded-2xl hover:brightness-110 active:brightness-90"
                >
                    <img src="/run.png" alt="" className="h-14 px-6 py-3"/>
                </button>
            </div>
        </div>
    )
}