import React, { useState, useEffect, useRef, useMemo } from "react";
import OutputComponent from './OutputComponent'
import InfoComponent from './InfoComponent'

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
    //<div className="w-screen h-screen flex gap-10 p-4 font-mono overflow-hidden">
    //  <div className="flex gap-4 p-4 w-6/7 mx-auto">

    //    <div className="flex-1 bg-[#2a2a2a] rounded-2xl p-3 flex flex-col gap-3">
    //      <InfoComponent />
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
        <div className="flex-1 bg-[#2a2a2a] rounded-2xl p-3 flex flex-col gap-3">
          <OutputComponent />
        </div>
      </div>

    </div>
  )
}