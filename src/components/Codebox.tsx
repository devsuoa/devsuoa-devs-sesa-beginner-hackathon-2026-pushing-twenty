import { useState } from "react";

export type ExpectedStep =
  | { kind: "assign"; var: string; val: number }
  | { kind: "print"; val: number };

interface CodeboxProps {
  lightcol: string;
  darkcol: string;
  headerimage: string;
  onOutput: (output: string, isError: boolean) => void;
  expectedTrace?: ExpectedStep[];
  expectedOutputStr?: string;
  level: number;
}

function approxEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

type AlienStep =
  | { kind: "assign"; var: string; val: number; lineNum: number }
  | { kind: "print"; val: number; lineNum: number };

function checkTrace(
  alienTrace: AlienStep[],
  expectedTrace: ExpectedStep[] | undefined
): string | null {
  if (!expectedTrace || expectedTrace.length === 0) return null;
  if (alienTrace.length !== expectedTrace.length)
    return "Alien Error: Translation incorrect";

  for (let i = 0; i < alienTrace.length; i++) {
    const a = alienTrace[i];
    const e = expectedTrace[i];
    if (a.kind !== e.kind)
      return `Alien Error [Line ${a.lineNum}]: Translation incorrect`;
    if (a.kind === "assign" && e.kind === "assign") {
      if (a.var !== e.var || !approxEqual(a.val, e.val))
        return `Alien Error [Line ${a.lineNum}]: Translation incorrect`;
    }
    if (a.kind === "print" && e.kind === "print") {
      if (!approxEqual(a.val, e.val))
        return `Alien Error [Line ${a.lineNum}]: Translation incorrect`;
    }
  }
  return null;
}

// ---- Level 1: HI / YAY / NO ----
// HI  var, value  →  var = value
// YAY var, value  →  var += value
// NO  var, value  →  var -= value
// value: integer literal or single variable x/y/z
// Implicit print z at the end if z is defined.
function runLevel1(
  code: string,
  expectedTrace?: ExpectedStep[]
): { output: string; error: boolean } {
  const lines = code
    .split("\n")
    .map((text, i) => ({ text: text.trim(), lineNum: i + 1 }))
    .filter((l) => l.text.length > 0);

  if (lines.length === 0)
    return { output: "Alien Error [Line 1]: Syntax Error", error: true };

  const STMT_RE = /^(HI|YAY|NO)\s+([xyz])\s*,\s*([xyz]|[0-9]+)$/;
  const vars: Record<string, number> = {};
  const alienTrace: AlienStep[] = [];

  for (const { text: line, lineNum } of lines) {
    const m = line.match(STMT_RE);
    if (!m)
      return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };

    const [, op, varName, valToken] = m;
    const isRef = /^[xyz]$/.test(valToken);

    if (isRef && vars[valToken] === undefined)
      return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };

    const val = isRef ? vars[valToken] : Number(valToken);

    let result: number;
    if (op === "HI") {
      result = val;
    } else if (op === "YAY") {
      if (vars[varName] === undefined)
        return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
      result = vars[varName] + val;
    } else {
      if (vars[varName] === undefined)
        return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
      result = vars[varName] - val;
    }

    vars[varName] = result;
    alienTrace.push({ kind: "assign", var: varName, val: result, lineNum });
  }

  if (vars["z"] === undefined)
    return { output: "No output", error: true };

  const lastLine = lines[lines.length - 1].lineNum;
  alienTrace.push({ kind: "print", val: vars["z"], lineNum: lastLine });

  const traceErr = checkTrace(alienTrace, expectedTrace);
  if (traceErr) return { output: traceErr, error: true };

  return { output: String(vars["z"]), error: false };
}

// ---- Level 2: :) assignment, :( print ----
// Expressions: only literal 1, vars x/y/z, operators +-*^, parens.
function validateExprL2(expr: string): boolean {
  const s = expr.replace(/\s/g, "");
  if (s.length === 0 || s.includes("**")) return false;
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if ("xyz".includes(ch)) {
      if (i + 1 < s.length && /[a-zA-Z]/.test(s[i + 1])) return false;
      i++;
    } else if (ch === "1") {
      if (i + 1 < s.length && /[0-9]/.test(s[i + 1])) return false;
      i++;
    } else if (/[0-9]/.test(ch)) {
      return false;
    } else if ("+-*^()".includes(ch)) {
      i++;
    } else {
      return false;
    }
  }
  return true;
}

function runLevel2(
  code: string,
  expectedTrace?: ExpectedStep[]
): { output: string; error: boolean } {
  const lines = code
    .split("\n")
    .map((text, i) => ({ text: text.trim(), lineNum: i + 1 }))
    .filter((l) => l.text.length > 0);

  if (lines.length === 0)
    return { output: "Alien Error [Line 1]: Syntax Error", error: true };

  const ASSIGN_RE = /^([xyz])\s*:\)\s*(.+)$/;
  const PRINT_RE = /^([xyz])\s*:\($/;
  const vars: Record<string, number> = {};
  const alienTrace: AlienStep[] = [];
  const outputLines: string[] = [];

  for (const { text: line, lineNum } of lines) {
    const printMatch = line.match(PRINT_RE);
    if (printMatch) {
      const v = printMatch[1];
      if (vars[v] === undefined)
        return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
      const val = vars[v];
      outputLines.push(String(val));
      alienTrace.push({ kind: "print", val, lineNum });
      continue;
    }

    const assignMatch = line.match(ASSIGN_RE);
    if (assignMatch) {
      const varName = assignMatch[1];
      const expr = assignMatch[2].trim();
      if (!validateExprL2(expr))
        return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };

      const exprClean = expr.replace(/\s/g, "");
      for (const v of ["x", "y", "z"]) {
        if (exprClean.includes(v) && vars[v] === undefined)
          return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
      }

      try {
        const jsExpr = expr.replace(/\^/g, "**");
        const result = new Function("x", "y", "z", `"use strict"; return (${jsExpr})`)(
          vars["x"], vars["y"], vars["z"]
        );
        if (typeof result !== "number" || !isFinite(result))
          return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
        vars[varName] = result;
        alienTrace.push({ kind: "assign", var: varName, val: result, lineNum });
      } catch {
        return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
      }
      continue;
    }

    return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
  }

  if (outputLines.length === 0)
    return { output: "No output", error: true };

  const traceErr = checkTrace(alienTrace, expectedTrace);
  if (traceErr) return { output: traceErr, error: true };

  return { output: outputLines.join("\n"), error: false };
}

// ---- Level 3: array init + copy ops + output ----
// "[N,...] into nums"   — initialise
// "nums[A] into nums[B]" — copy (1-indexed)
// "output nums"          — print
function runLevel3(
  code: string,
  expectedOutputStr?: string
): { output: string; error: boolean } {
  const lines = code
    .split("\n")
    .map((text, i) => ({ text: text.trim(), lineNum: i + 1 }))
    .filter((l) => l.text.length > 0);

  if (lines.length === 0)
    return { output: "Alien Error [Line 1]: Syntax Error", error: true };

  const INIT_RE   = /^\[\s*(\d+(?:\s*,\s*\d+)*)\s*\]\s+into\s+nums$/;
  const COPY_RE   = /^nums\s*\[\s*(\d+)\s*\]\s+into\s+nums\s*\[\s*(\d+)\s*\]$/;
  const OUTPUT_RE = /^output\s+nums$/;

  const firstLine = lines[0];
  const initMatch = firstLine.text.match(INIT_RE);
  if (!initMatch)
    return { output: "Alien Error [Line 1]: Syntax Error", error: true };

  const nums = initMatch[1].split(",").map((s) => Number(s.trim()));
  const len = nums.length;
  const outputLines: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const { text: line, lineNum } = lines[i];

    const copyMatch = line.match(COPY_RE);
    if (copyMatch) {
      const from = Number(copyMatch[1]);
      const to   = Number(copyMatch[2]);
      if (from < 1 || from > len || to < 1 || to > len)
        return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
      nums[to - 1] = nums[from - 1];
      continue;
    }

    if (OUTPUT_RE.test(line)) {
      outputLines.push("[" + nums.join(", ") + "]");
      continue;
    }

    return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
  }

  if (outputLines.length === 0)
    return { output: "No output", error: true };

  const outputStr = outputLines.join("\n");

  if (expectedOutputStr && outputStr !== expectedOutputStr)
    return { output: "Alien Error: Translation incorrect", error: true };

  return { output: outputStr, error: false };
}

// ---- component ----
export default function Codebox(props: CodeboxProps) {
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      let result;
      if (props.level === 1) result = runLevel1(code, props.expectedTrace);
      else if (props.level === 2) result = runLevel2(code, props.expectedTrace);
      else result = runLevel3(code, props.expectedOutputStr);
      props.onOutput(result.output, result.error);
      setRunning(false);
    }, 300);
  };

  return (
    <div
      style={{ backgroundColor: props.lightcol, boxShadow: `0 12px 0 ${props.darkcol}` }}
      className="rounded-2xl overflow-hidden flex flex-col mt-25 flex-1 min-h-0"
    >
      <div className="flex items-center justify-center p-4">
        <img src={"/" + props.headerimage} alt={props.headerimage} className="relative h-12 w-auto object-contain" />
      </div>

      <textarea
        style={{ fontFamily: "'Fira Code', monospace", color: "white", backgroundColor: props.darkcol }}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write alien code here!"
        className="p-6 text-2xl mx-4 rounded-lg resize-none flex-1 min-h-0"
      />

      <div className="m-4 mx-4 h-14">
        <button
          onClick={handleRun}
          disabled={running}
          style={{
            backgroundColor: "#00A93D",
            boxShadow: "0 6px 0 #00531F",
            opacity: running ? 0.7 : 1,
            cursor: running ? "not-allowed" : "pointer",
          }}
          className="rounded-2xl hover:brightness-110 active:brightness-90"
        >
          <img src="/run.png" alt="" className="h-14 px-6 py-3" />
        </button>
      </div>
    </div>
  );
}
