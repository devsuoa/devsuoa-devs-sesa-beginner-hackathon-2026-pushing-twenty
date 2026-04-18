import { useState } from "react";

// ---- types shared between executor and props ----
export type ExpectedStep =
  | { kind: "assign"; var: string; val: number }
  | { kind: "print"; val: number };

interface CodeboxProps {
  lightcol: string;
  darkcol: string;
  headerimage: string;
  onOutput: (output: string, isError: boolean) => void;
  expectedTrace?: ExpectedStep[];
}

// ---- expression validator ----
// Allowed: single-char vars x/y/z, literal 1 only, operators +-*^, parens.
// Spaces are ignored. :) and :( must be together (enforced by caller regex).
function validateExpression(expr: string): boolean {
  const s = expr.replace(/\s/g, "");
  if (s.length === 0) return false;
  if (s.includes("**")) return false;

  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if ("xyz".includes(ch)) {
      // no multi-char identifiers
      if (i + 1 < s.length && /[a-zA-Z]/.test(s[i + 1])) return false;
      i++;
    } else if (ch === "1") {
      // only 1 is a valid literal — 11, 12, etc. are invalid
      if (i + 1 < s.length && /[0-9]/.test(s[i + 1])) return false;
      i++;
    } else if (/[0-9]/.test(ch)) {
      return false; // 2, 3, … all forbidden
    } else if ("+-*^()".includes(ch)) {
      i++;
    } else {
      return false;
    }
  }
  return true;
}

function approxEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

// ---- interpreter ----
type AlienStep =
  | { kind: "assign"; var: string; val: number; lineNum: number }
  | { kind: "print"; val: number; lineNum: number };

function runAlienCode(code: string, expectedTrace?: ExpectedStep[]): { output: string; error: boolean } {
  // Trim every line, drop blanks, keep original line numbers
  const lines: Array<{ text: string; lineNum: number }> = code
    .split("\n")
    .map((text, i) => ({ text: text.trim(), lineNum: i + 1 }))
    .filter((l) => l.text.length > 0);

  if (lines.length === 0) {
    return { output: "Alien Error [Line 1]: Syntax Error", error: true };
  }

  // :) assignment — space allowed around :) but NOT inside it
  const ASSIGNMENT_RE = /^([xyz])\s*:\)\s*(.+)$/;
  // :( print — any of x/y/z, space allowed before :(, NOT inside it
  const PRINT_RE = /^([xyz])\s*:\($/;

  const vars: Record<string, number> = {};
  const alienTrace: AlienStep[] = [];
  const outputLines: string[] = [];

  for (const { text: line, lineNum } of lines) {
    // --- print ---
    const printMatch = line.match(PRINT_RE);
    if (printMatch) {
      const v = printMatch[1];
      if (vars[v] === undefined) {
        return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
      }
      const val = vars[v];
      outputLines.push(String(val));
      alienTrace.push({ kind: "print", val, lineNum });
      continue;
    }

    // --- assignment ---
    const assignMatch = line.match(ASSIGNMENT_RE);
    if (assignMatch) {
      const varName = assignMatch[1];
      const expr = assignMatch[2].trim();

      if (!validateExpression(expr)) {
        return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
      }

      // every referenced variable must be defined
      const exprClean = expr.replace(/\s/g, "");
      for (const v of ["x", "y", "z"]) {
        if (exprClean.includes(v) && vars[v] === undefined) {
          return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
        }
      }

      try {
        const jsExpr = expr.replace(/\^/g, "**");
        const result = new Function("x", "y", "z", `"use strict"; return (${jsExpr})`)(
          vars["x"], vars["y"], vars["z"]
        );
        if (typeof result !== "number" || !isFinite(result)) {
          return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
        }
        vars[varName] = result;
        alienTrace.push({ kind: "assign", var: varName, val: result, lineNum });
      } catch {
        return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
      }
      continue;
    }

    // --- unrecognised line ---
    return { output: `Alien Error [Line ${lineNum}]: Syntax Error`, error: true };
  }

  if (outputLines.length === 0) {
    return { output: "No output", error: true };
  }

  // ---- line-by-line translation check ----
  if (expectedTrace && expectedTrace.length > 0) {
    if (alienTrace.length !== expectedTrace.length) {
      return { output: "Alien Error: Translation incorrect", error: true };
    }

    for (let i = 0; i < alienTrace.length; i++) {
      const a = alienTrace[i];
      const e = expectedTrace[i];

      if (a.kind !== e.kind) {
        return { output: `Alien Error [Line ${a.lineNum}]: Translation incorrect`, error: true };
      }

      if (a.kind === "assign" && e.kind === "assign") {
        if (a.var !== e.var || !approxEqual(a.val, e.val)) {
          return { output: `Alien Error [Line ${a.lineNum}]: Translation incorrect`, error: true };
        }
      }

      if (a.kind === "print" && e.kind === "print") {
        if (!approxEqual(a.val, e.val)) {
          return { output: `Alien Error [Line ${a.lineNum}]: Translation incorrect`, error: true };
        }
      }
    }
  }

  return { output: outputLines.join("\n"), error: false };
}

// ---- component ----
export default function Codebox(props: CodeboxProps) {
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      const { output, error } = runAlienCode(code, props.expectedTrace);
      props.onOutput(output, error);
      setRunning(false);
    }, 300);
  };

  return (
    <div
      style={{ backgroundColor: props.lightcol, boxShadow: `0 12px 0 ${props.darkcol}` }}
      className="rounded-2xl overflow-hidden flex flex-col mt-25"
    >
      <div className="flex items-center justify-center p-4">
        <img src={"/" + props.headerimage} alt={props.headerimage} className="relative h-12 w-auto object-contain" />
      </div>

      <textarea
        style={{ fontFamily: "'Fira Code', monospace", color: "white", backgroundColor: props.darkcol }}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write alien code here!"
        className="p-6 text-2xl mx-4 rounded-lg resize-none min-h-[300px]"
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
