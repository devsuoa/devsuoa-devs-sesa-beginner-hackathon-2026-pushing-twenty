import Codebox, { type ExpectedStep } from "../../components/Codebox";
import Textbox from "../../components/Textbox";
import LevelSelect from "../../components/LevelSelect";
import { useState } from "react";

// ---- level content ----
const LEVEL_CONFIGS: Record<number, {
  pythonCode: string;
  alienCode: string;
  task: string;
  expectedOutputStr?: string;
}> = {
  1: {
    pythonCode: `x = 3\ny = 3\nx += 2\ny -= x`,
    alienCode: `HI x, 3\nHI y, 3\nYAY x, 2\nNO y, x`,
    task: `Translate this Python code into Alien code:\nx = 2\ny = 1\nz = x\nz -= x\nz += y`,
  },
  2: {
    pythonCode: `x = 5\ny = x - 3\nz = x ** 2\nprint(z)`,
    alienCode: `x :) 1 + 1 + 1 + 1 + 1\ny :) x - 1 - 1 - 1\nz :) y ^ (1 + 1) \nz :(`,
    task: `Translate this Python code to Alien code:\nx = 2\ny = x ** (-2)\nprint(y)`,
  },
  3: {
    pythonCode: `nums = [1,2,3]\nnums[1] = nums[0]\nnums[2] = nums[1]\nprint(nums)`,
    alienCode: `[1,2,3] into nums\nnums[1] into nums[2]\nnums[2] into nums[3]\noutput nums`,
    task: `1. Initialise nums as [1,2,3]\n2. ONLY using "nums[X] into nums[Y]", turn nums into [3,3,2]\n3. Print nums`,
    expectedOutputStr: "[3, 3, 2]",
  },
};

// ---- trace builders ----

// Level 1: handles =, +=, -= with simple exprs; implicit print z at end.
function evalPythonTaskL1(taskText: string): ExpectedStep[] {
  const lines = taskText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^translate/i.test(l));

  const vars: Record<string, number> = {};
  const trace: ExpectedStep[] = [];

  const evalExpr = (expr: string) => {
    try {
      return new Function("x", "y", "z", `"use strict"; return (${expr})`)(
        vars.x, vars.y, vars.z
      ) as number;
    } catch { return 0; }
  };

  for (const line of lines) {
    const addEq = line.match(/^([xyz])\s*\+=\s*(.+)$/);
    const subEq = line.match(/^([xyz])\s*-=\s*(.+)$/);
    const assign = line.match(/^([xyz])\s*=\s*(.+)$/);

    if (addEq) {
      const [, v, expr] = addEq;
      vars[v] = (vars[v] ?? 0) + evalExpr(expr);
      trace.push({ kind: "assign", var: v, val: vars[v] });
    } else if (subEq) {
      const [, v, expr] = subEq;
      vars[v] = (vars[v] ?? 0) - evalExpr(expr);
      trace.push({ kind: "assign", var: v, val: vars[v] });
    } else if (assign) {
      const [, v, expr] = assign;
      vars[v] = evalExpr(expr);
      trace.push({ kind: "assign", var: v, val: vars[v] });
    }
  }

  if (vars["z"] !== undefined) {
    trace.push({ kind: "print", val: vars["z"] });
  }
  return trace;
}

// Level 2: handles = and print(var).
function evalPythonTaskL2(taskText: string): ExpectedStep[] {
  const lines = taskText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^translate/i.test(l));

  const vars: Record<string, number> = {};
  const trace: ExpectedStep[] = [];

  for (const line of lines) {
    const assign = line.match(/^([a-z])\s*=\s*(.+)$/);
    const print_ = line.match(/^print\(([^)]+)\)$/);
    if (assign) {
      try {
        const result = new Function("x", "y", "z", `"use strict"; return (${assign[2]})`)(
          vars.x, vars.y, vars.z
        ) as number;
        vars[assign[1]] = result;
        trace.push({ kind: "assign", var: assign[1], val: result });
      } catch { /* skip */ }
    } else if (print_) {
      const v = print_[1].trim();
      if (vars[v] !== undefined) trace.push({ kind: "print", val: vars[v] });
    }
  }
  return trace;
}

function padTo8Lines(text: string): string {
  const lines = text.split("\n");
  while (lines.length < 8) lines.push("");
  return lines.join("\n");
}

function getExpectedTrace(level: number, taskText: string): ExpectedStep[] {
  if (level === 1) return evalPythonTaskL1(taskText);
  if (level === 2) return evalPythonTaskL2(taskText);
  return [];
}

// ---- component ----
function Home() {
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [output, setOutput] = useState("Waiting for code...");
  const [isError, setIsError] = useState<boolean | null>(null);

  const config = LEVEL_CONFIGS[selectedLevel] ?? LEVEL_CONFIGS[2];
  const expectedTrace = getExpectedTrace(selectedLevel, config.task);

  const handleLevelSelect = (level: number) => {
    setSelectedLevel(level);
    setOutput("Waiting for code...");
    setIsError(null);
  };

  const handleOutput = (text: string, error: boolean) => {
    setOutput(text);
    setIsError(error);
  };

  const outputLight = isError === null ? "#5E5E5E" : isError ? "#A90000" : "#00A93D";
  const outputDark  = isError === null ? "#2E2E2E" : isError ? "#530000" : "#00531F";

  return (
    <div className="relative min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat flex flex-col justify-center py-8">
      <div className="flex w-full max-w-[1600px] mx-auto px-8 gap-10 -mt-[30px]">

        {/* level select */}
        <LevelSelect active={selectedLevel} onSelect={handleLevelSelect} />

        {/* main content */}
        <div className="flex-1 flex flex-col gap-6">

          {/* main row: logo + examples on left | codebox on right — codebox bottom aligns with examples bottom */}
          <div className="flex gap-10 items-stretch">
            <div className="flex-1 flex flex-col gap-6">
              <img src="logo.png" alt="Logo" className="w-140 mx-auto" />
              <div className="flex gap-6">
                <div className="flex-1">
                  <Textbox lightcol="#005DA9" darkcol="#002E53" text={config.pythonCode} headerimage="pythoncode.png" />
                </div>
                <div className="flex-1">
                  <Textbox lightcol="#00A93D" darkcol="#00531F" text={config.alienCode} headerimage="aliencode.png" />
                </div>
              </div>
            </div>
            <div className="flex-[0.65] flex flex-col">
              <Codebox
                key={selectedLevel}
                lightcol="#5E5E5E"
                darkcol="#2E2E2E"
                headerimage="code.png"
                onOutput={handleOutput}
                expectedTrace={expectedTrace}
                expectedOutputStr={config.expectedOutputStr}
                level={selectedLevel}
              />
            </div>
          </div>

          {/* bottom row: task (left) | output (right) */}
          <div className="flex gap-10">
            <div className="flex-1">
              <Textbox lightcol="#5E5E5E" darkcol="#2E2E2E" text={padTo8Lines(config.task)} headerimage="task.png" />
            </div>
            <div className="flex-[0.65] flex flex-col">
              <Textbox lightcol={outputLight} darkcol={outputDark} text={output} headerimage="output.png" stretch />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Home;
