import React, { useState, useEffect, useRef, useMemo } from 'react'
import { generatePlanetLanguage } from "../language/generator/generatePlanetLanguage";
import { parseAlien } from "../language/parse/parseAlien";
import { renderPython } from "../language/render/renderPython";
import { validateAlienSource } from "../language/validate/validateAlienSource";

const OutputComponent = ({ seed }: { seed: number }) => {
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [translatedPython, setTranslatedPython] = useState("");
  const [pyodideReady, setPyodideReady] = useState(false)
  const pyodideRef = useRef<any>(null)
  const outputExpected = "9"

  // Use a fixed seed for this level for now
  const lang = useMemo(() => generatePlanetLanguage(seed), []);

  useEffect(() => {
    const loadPyodide = async () => {
      // @ts-ignore
      pyodideRef.current = await window.loadPyodide()
      setPyodideReady(true)
    }
    loadPyodide()
  }, [])

  const runCode = async () => {
    if (!pyodideRef.current) return
    if (!pyodideRef.current) return;

    const validation = validateAlienSource(code, lang);

    if (!validation.isValid) {
      setTranslatedPython("");
      setOutput(
        validation.issues
          .map(
            (issue) =>
              `Line ${issue.line}, Col ${issue.column}: ${issue.message}`,
          )
          .join("\n"),
      );
      return;
    }
    try {
      // 1. Alien -> AST
      const ast = parseAlien(code, lang);
      console.log(ast);
      // 2. AST -> Python
      const pythonCode = renderPython(ast);
      setTranslatedPython(pythonCode);
      

      // 3. Reset stdout
      await pyodideRef.current.runPythonAsync(`
import sys, io
sys.stdout = io.StringIO()
nums = [1, 2, 3]
      `);

      // 4. Run translated Python
      await pyodideRef.current.runPythonAsync(pythonCode);

      // 5. Get output
      const result = await pyodideRef.current.runPythonAsync(`sys.stdout.getvalue()`);
      setOutput(String(result));
    } catch (err: any) {
      setOutput(err?.message ?? String(err));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const el = e.target as HTMLTextAreaElement
      const { selectionStart, selectionEnd } = el
      const newValue = code.slice(0, selectionStart) + "    " + code.slice(selectionEnd)
      setCode(newValue)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = selectionStart + 4
      })
    }
  }

  return (
    <div className="flex-1 p-3 flex flex-col gap-3">
        {/* Editor */}
        <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder="write code here!"
        className=" bg-[#3a3a3a] text-gray-300 text-sm font-mono p-4 rounded-xl resize-none outline-none placeholder-gray-500 flex-1"
        />

        {/* Submit button */}
        <button
        onClick={runCode}
        disabled={!pyodideReady}
        className="bg-green-600 hover:bg-green-500 hover:animate-pulse disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg text-sm w-fit transition duration:300"
        >
            {pyodideReady ? "submit" : "loading python..."}
        </button>

        {/* Output */}
        <div className="text-gray-300 text-sm font-bold tracking-widest">OUTPUT:</div>
        <div className="bg-[#3a3a3a] rounded-xl p-4 text-gray-100 text-sm font-mono min-h-10">
            {output || <span className="text-gray-100">output appears here</span>}
        </div>

        <div className="text-gray-300 text-sm font-bold tracking-widest">EXPECTED OUTPUT:</div>
        <div className="bg-[#3a3a3a] rounded-xl p-4 text-sm font-mono min-h-10">
            <span className="text-gray-100">{outputExpected}</span>
        </div>
    </div>
  )
}

export default OutputComponent

