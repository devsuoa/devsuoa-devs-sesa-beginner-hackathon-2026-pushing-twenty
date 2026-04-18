import React, { useState, useEffect, useRef, useMemo } from 'react'
import { generatePlanetLanguage } from "../language/generator/generatePlanetLanguage";
import { verifySubmission } from "../runtime/verifySubmission";
import { squareLengthLevel } from "../levels/squareLengthLevel";
import { getPyodide } from "../runtime/getPyodide";

const OutputComponent = ({ seed, onComplete }: { seed: number; onComplete?: (value: boolean) => void }) => {
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [translatedPython, setTranslatedPython] = useState("")
  const [pyodideReady, setPyodideReady] = useState(false)
  const [taskComplete, setTaskComplete] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const pyodideRef = useRef<any>(null)
  const outputExpected = "9"

  const lang = useMemo(() => generatePlanetLanguage(seed), [seed])

  useEffect(() => {
    getPyodide()
      .then((pyodide) => {
        pyodideRef.current = pyodide
        setPyodideReady(true)
      })
      .catch((err) => console.error(err))
  }, [])

  const runCode = async () => {
    if (!pyodideReady) return

    setTaskComplete(false)
    setStatusMessage("Checking solution...")

    const result = await verifySubmission(code, lang, squareLengthLevel)

    setTranslatedPython(result.translatedPython)

    if (result.validationError) {
      setOutput(result.validationError)
      setStatusMessage("Not quite right")
      return
    }

    if (result.parseError) {
      setOutput(`Translation error:\n${result.parseError}`)
      setStatusMessage("Translation failed")
      return
    }

    if (result.runtimeError) {
      setOutput(`Runtime error:\n${result.runtimeError}`)
      setStatusMessage("Runtime error")
      return
    }

    const visibleText = result.visibleResults
      .map((test, index) =>
        test.passed
          ? `Visible test ${index + 1}: passed`
          : `Visible test ${index + 1}: failed\nExpected: ${JSON.stringify(test.expected)}\nGot: ${JSON.stringify(test.actual)}`
      )
      .join("\n\n")
    
    let hiddenText = ""
    if (result.hiddenPassedCount < result.hiddenTotal) {
      hiddenText = `Some hidden tests failed!`
    }
    
    
    setOutput(`${visibleText}\n${hiddenText}`)

    if (result.passed) {
      setTaskComplete(true)
      setStatusMessage("Level complete!")
      onComplete?.(true)
    } else {
      setTaskComplete(false)
      setStatusMessage("Keep going")
      onComplete?.(false)
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
    <div
      className={`flex-1 p-3 rounded-2xl flex flex-col gap-3 transition-all duration-500 ${
        taskComplete
          ? "bg-[#2a2a2a] ring-2 ring-green-400"
          : "bg-[#2a2a2a]"
      }`}
    >
      <div
        className={`text-sm font-bold tracking-widest transition-colors duration-300 ${
          taskComplete ? "text-green-300" : "text-gray-300"
        }`}
      >
        {statusMessage || "WRITE YOUR ALIEN CODE"}
      </div>

      {taskComplete && (
        <div className="rounded-xl border border-green-300 text-green-100 px-4 py-3 text-sm font-bold">
          Level complete!
        </div>
      )}

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder="write code here!"
        className={`text-sm font-mono p-4 rounded-xl resize-none outline-none placeholder-gray-500 flex-1 transition-all duration-300 ${
          taskComplete
            ? "bg-[#3a3a3a] text-gray-300 border border-green-400"
            : "bg-[#3a3a3a] text-gray-300"
        }`}
      />

      <button
        onClick={runCode}
        disabled={!pyodideReady}
        className={`font-bold py-2 px-6 rounded-lg text-sm w-fit transition-all duration-300 ${
          taskComplete
            ? "bg-yellow-600 hover:bg-yellow-500 text-black"
            : "bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white"
        }`}
      >
        {pyodideReady
          ? taskComplete
            ? "run again"
            : "submit"
          : "loading python..."}
      </button>

      <div className="text-gray-300 text-sm font-bold tracking-widest">OUTPUT:</div>
      <div className="bg-[#3a3a3a] rounded-xl p-4 text-gray-100 text-sm font-mono min-h-10 whitespace-pre-wrap">
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