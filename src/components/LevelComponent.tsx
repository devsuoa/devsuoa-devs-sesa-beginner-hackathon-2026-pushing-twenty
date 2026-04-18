import React, { useState, useEffect, useRef } from 'react'

export default function LevelComponent() {
  const [code, setCode] = useState("Enter code here!")
  const [output, setOutput] = useState("")
  const [pyodideReady, setPyodideReady] = useState(false)
  const pyodideRef = useRef<any>(null)

  // Load Pyodide on mount
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
    
    // Capture stdout
    await pyodideRef.current.runPythonAsync(`
      import sys
      import io
      sys.stdout = io.StringIO()
    `)

    try {
      await pyodideRef.current.runPythonAsync(code)
      const result = await pyodideRef.current.runPythonAsync(`sys.stdout.getvalue()`)
      setOutput(result)
    } catch (err: any) {
      setOutput(err.message)
    }
  }

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
    <div className="w-screen h-screen grid grid-cols-2 font-mono bg-gray-100">

      {/* Left panel */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex gap-3">
          <div className="flex-1 bg-green-950 border-2 border-white rounded-2xl p-3 text-white">
            <div className="italic font-bold mb-2">PYTHON CODE</div>
            <pre className="text-sm leading-relaxed m-0">
            {`nums = [1,2,3]
sum = 0
for i in nums:
    sum += i
print(sum)`}
            </pre>
          </div>
          <div className="flex-1 bg-green-950 border-[3px] border-white rounded-2xl p-3 text-white">
            <div className="italic font-bold mb-2">ALIEN CODE</div>
            <pre className="text-sm leading-relaxed m-0">
            {`plz make nums [1,2,3] ty
plz make sums 0 ty
plz i go through nums ty
  plz add i to sum ty
plz print sum ty`}
            </pre>
          </div>
        </div>
        <div className="bg-green-950 rounded-lg px-5 py-4 text-white text-sm">
          GOAL: IN <strong className="font-mono">ALIEN CODE</strong>, print the square of all numbers.
        </div>

        {/* Output */}
        <div className="bg-zinc-900 rounded-lg p-4 text-green-400 text-sm font-mono h-32 overflow-auto">
          <div className="text-zinc-500 mb-1">Output:</div>
          <pre>{output}</pre>
        </div>
        
      </div>

      {/* Right panel */}
      <div className="flex flex-col gap-3 m-4">

        {/* Editor */}
        <div className="flex-1 bg-zinc-700 rounded-lg overflow-hidden">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="w-full h-full bg-transparent text-white text-sm font-mono p-4 resize-none outline-none"
          />
        </div>

        {/* Run button */}
        <button
          onClick={runCode}
          disabled={!pyodideReady}
          className="bg-green-700 hover:bg-green-600 disabled:bg-zinc-500 text-white font-bold py-2 rounded-lg"
        >
          {pyodideReady ? "Run" : "Loading Python..."}
        </button>

      </div>

    </div>
  )
}