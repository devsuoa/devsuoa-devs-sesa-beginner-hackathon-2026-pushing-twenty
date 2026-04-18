import Codebox, { type ExpectedStep } from "../../components/Codebox";
import Textbox from "../../components/Textbox";
import {useState} from "react"

const PYTHON_CODE = `x = 5\ny = x - 3\nz = x ** 2\nprint(z)`;
const ALIEN_CODE = `x :) 1 + 1 + 1 + 1 + 1\ny :) x - 1 - 1 - 1\nz :) y ^ (1 + 1) \nz :(`;
const TASK = `Translate this Python code to Alien code:\nx = 2\ny = x ** (-2)\nprint(y)`;

// Walk the Python lines in TASK and build an expected execution trace.
// Supports: single-char var assignment and print(var).
function evalPythonTask(taskText: string): ExpectedStep[] {
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
        );
        vars[assign[1]] = result;
        trace.push({ kind: "assign", var: assign[1], val: result });
      } catch { /* skip malformed task lines */ }
    } else if (print_) {
      const v = print_[1].trim();
      if (vars[v] !== undefined) {
        trace.push({ kind: "print", val: vars[v] });
      }
    }
  }
  return trace;
}

const EXPECTED_TRACE: ExpectedStep[] = evalPythonTask(TASK);

function Home() {
  const [output, setOutput] = useState("Waiting for code...");
  const [isError, setIsError] = useState<boolean | null>(null);

  const handleOutput = (text: string, error: boolean) => {
    setOutput(text);
    setIsError(error);
  };

  const outputLight = isError === null ? "#5E5E5E" : isError ? "#A90000" : "#00A93D";
  const outputDark  = isError === null ? "#2E2E2E" : isError ? "#530000" : "#00531F";

  return (
    // bg image
    <div className="relative min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <div className="flex max-w-[1600px] mx-auto px-8 gap-10">
        {/* left */}
        <div className="flex-1 flex flex-col gap-6">

          {/* logo */}
          <div><img src="logo.png" alt="Logo" className="mx-auto w-140"/></div>

          {/* python and alien code */}
          <div className="flex gap-6">
            <div className="flex-1">
              <Textbox
                lightcol="#005DA9"
                darkcol="#002E53"
                text={PYTHON_CODE}
                headerimage="pythoncode.png"
              />
            </div>
            <div className="flex-1">
              <Textbox
                lightcol="#00A93D"
                darkcol="#00531F"
                text={ALIEN_CODE}
                headerimage="aliencode.png"
              />
            </div>
          </div>

          {/* task */}
          <div>
            <Textbox
                lightcol="#5E5E5E"
                darkcol="#2E2E2E"
                text={TASK}
                headerimage="task.png"
              />
          </div>
        </div>

        {/* right */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <Codebox
                lightcol="#5E5E5E"
                darkcol="#2E2E2E"
                headerimage="code.png"
                onOutput={handleOutput}
                expectedTrace={EXPECTED_TRACE}></Codebox>
          </div>
          <div>
            <Textbox
                lightcol={outputLight}
                darkcol={outputDark}
                text={output}
                headerimage="output.png"
              />
          </div>
        </div>


      </div>
    </div>
  );
}

export default Home;
