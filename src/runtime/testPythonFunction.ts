import { getPyodide } from "./getPyodide";

export interface PythonTestCase {
  args: unknown[];
  expected: unknown;
}

export interface PythonTestResult {
  passed: boolean;
  actual?: unknown;
  error?: string;
}

export interface PythonTestRunResult {
  results: PythonTestResult[];
  error?: string;
}

function toPythonLiteral(value: unknown): string {
  if (typeof value === "number") {
    return value.toString();
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  if (value === null) {
    return "None";
  }

  if (Array.isArray(value)) {
    return `[${value.map(toPythonLiteral).join(", ")}]`;
  }

  return JSON.stringify(value);
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function pyValueToJs(value: unknown): unknown {
  if (
    value !== null &&
    typeof value === "object" &&
    "toJs" in value &&
    typeof (value as { toJs?: unknown }).toJs === "function"
  ) {
    return (value as { toJs: () => unknown }).toJs();
  }

  return value;
}

export async function testPythonFunction(
  pythonSource: string,
  functionName: string,
  testCases: PythonTestCase[],
): Promise<PythonTestRunResult> {
  try {
    const pyodide = await getPyodide();

    await pyodide.runPythonAsync(pythonSource);

    const exists = await pyodide.runPythonAsync(`
"${functionName}" in globals()
    `);

    if (!exists) {
      return {
        results: [],
        error: `Function "${functionName}" is not defined.`,
      };
    }

    const results: PythonTestResult[] = [];

    for (const test of testCases) {
      try {
        const argsLiteral = test.args.map(toPythonLiteral).join(", ");

        const pythonCall = `
result = ${functionName}(${argsLiteral})
result
        `;

        const rawActual = await pyodide.runPythonAsync(pythonCall);
        const actual = pyValueToJs(rawActual);

        results.push({
          passed: deepEqual(actual, test.expected),
          actual,
        });
      } catch (err) {
        results.push({
          passed: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return { results };
  } catch (err) {
    return {
      results: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}