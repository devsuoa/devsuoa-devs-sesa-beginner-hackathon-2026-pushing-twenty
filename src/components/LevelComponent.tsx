import React, { useState, useEffect, useRef, useMemo } from "react";
import { generatePlanetLanguage } from "../language/generator/generatePlanetLanguage";
import { parseAlien } from "../language/parse/parseAlien";
import { renderPython } from "../language/render/renderPython";
import { renderAlien } from "../language/render/renderAlien";
import { parsePythonWithTreeSitter } from "../language/parse/parsePythonWithTreeSitter";
import type { ProgramNode } from "../language/types";
import { validateAlienSource } from "../language/validate/validateAlienSource";

export default function LevelComponent() {
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [translatedPython, setTranslatedPython] = useState("");
  const [exampleAst, setExampleAst] = useState<ProgramNode | null>(null);
  const [exampleAlien, setExampleAlien] = useState("");
  const [exampleError, setExampleError] = useState("");
  const [pyodideReady, setPyodideReady] = useState(false)
  const pyodideRef = useRef<any>(null)
  const sourcePython = `
nums = [1,2,3]
sum = 0
for i in nums:
  sum += i
print(sum)
`.trim();
  

  // Use a fixed seed for this level for now
  const lang = useMemo(() => generatePlanetLanguage(2), []);

  useEffect(() => {
    const loadPyodide = async () => {
      // @ts-ignore
      pyodideRef.current = await window.loadPyodide()
      setPyodideReady(true)
    }
    loadPyodide()
  }, [])

  useEffect(() => {
    let cancelled = false;

    const parseExample = async () => {
      try {
        setExampleError("");

        const ast = await parsePythonWithTreeSitter(sourcePython);
        if (cancelled) return;

        setExampleAst(ast);
        setExampleAlien(renderAlien(ast, lang));
      } catch (err) {
        if (cancelled) return;
        setExampleError(err instanceof Error ? err.message : String(err));
      }
    };

    parseExample();

    return () => {
      cancelled = true;
    };
  }, [sourcePython, lang]);

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
    <div className="w-screen h-screen flex gap-4 p-4 bg-[#0a0f2e] font-mono overflow-hidden">

      {/* Left panel */}
      <div className="flex-1 bg-[#2a2a2a] rounded-2xl p-5 flex flex-col gap-4">

        {/* Title */}
        <h1 className="text-center text-2xl font-black tracking-widest text-green-400"
          style={{ textShadow: "2px 2px 0px #166534, -1px -1px 0px #166534, 1px -1px 0px #166534, -1px 1px 0px #166534" }}>
          ALIEN PYTHON
        </h1>

        {/* Code panels */}
        <div className="flex gap-3">
          {/* Python */}
          <div className="flex-1 bg-[#3a7bd5] rounded-2xl overflow-hidden">
            <div className="bg-[#2d5fa8] text-white text-xs text-center py-2 tracking-widest font-bold">
              *** PYTHON CODE ***
            </div>
            <div className="bg-[#4a8be0] m-2 rounded-xl p-3">
              <pre className="text-white text-xs leading-relaxed m-0">{sourcePython}</pre>
            </div>
          </div>

          {/* Alien */}
          <div className="flex-1 bg-[#2d7a3a] rounded-2xl overflow-hidden">
            <div className="bg-[#1f5c29] text-white text-xs text-center py-2 tracking-widest font-bold">
              *** ALIEN CODE ***
            </div>
            <div className="bg-[#3a9447] m-2 rounded-xl p-3">
              <pre className="text-white text-xs leading-relaxed m-0">{exampleError ? `Error: ${exampleError}` : exampleAlien || "Loading..."}</pre>
            </div>
          </div>
        </div>

        {/* Goal text */}
        <div className="text-gray-300 text-xs leading-relaxed">
          <p className="mb-2">The code above are equivalent.</p>
          <p className="mb-2">YOUR GOAL: Write a program in<br />
          ALIEN CODE that outputs the<br />
          SQUARE OF THE LENGTH OF nums.</p>
          <p className="mb-2">Assume nums is already defined.</p>
          <p>(Hint: you cannot use any +-*/ or **)</p>
        </div>

      </div>

      {/* Right panel */}
      <div className="flex-1 bg-[#2a2a2a] rounded-2xl p-5 flex flex-col gap-3">

        {/* Editor */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          placeholder="write code here!"
          className="flex-1 bg-[#3a3a3a] text-gray-300 text-sm font-mono p-4 rounded-xl resize-none outline-none placeholder-gray-500"
        />

        {/* Submit button */}
        <button
          onClick={runCode}
          disabled={!pyodideReady}
          className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg text-sm w-fit"
        >
          {pyodideReady ? "submit" : "loading python..."}
        </button>

        {/* Output */}
        <div className="text-gray-300 text-sm font-bold tracking-widest">OUTPUT:</div>
        <div className="bg-[#3a3a3a] rounded-xl p-4 text-gray-400 text-sm font-mono min-h-[60px]">
          {output || <span className="text-gray-600">output</span>}
        </div>

      </div>

    </div>
  )
}