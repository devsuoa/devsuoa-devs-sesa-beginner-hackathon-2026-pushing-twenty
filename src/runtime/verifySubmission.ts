import type { GeneratedPlanetLanguage } from "../language/types";
import { parseAlien } from "../language/parse/parseAlien";
import { renderPython } from "../language/render/renderPython";
import { validateAlienSource } from "../language/validate/validateAlienSource";
import type { LevelConfig, LevelTestCase } from "../levels/levelTypes";
import { wrapUserCodeInFunction } from "./wrapUserCodeInFunction";
import { testPythonFunction } from "./testPythonFunction";

export interface SubmissionTestResult {
  passed: boolean;
  inputs: unknown[];
  expected: unknown;
  actual?: unknown;
  visible: boolean;
  error?: string;
}

export interface SubmissionResult {
  passed: boolean;
  translatedPython: string;
  parseError?: string;
  runtimeError?: string;
  validationError?: string;
  visibleResults: SubmissionTestResult[];
  hiddenPassedCount: number;
  hiddenTotal: number;
}

function formatValidationErrors(
  issues: { line: number; column: number; message: string }[],
): string {
  return issues
    .map((issue) => `Line ${issue.line}, Col ${issue.column}: ${issue.message}`)
    .join("\n");
}

export async function verifySubmission(
  alienSource: string,
  lang: GeneratedPlanetLanguage,
  level: LevelConfig,
): Promise<SubmissionResult> {
  const validation = validateAlienSource(alienSource, lang);

  if (!validation.isValid) {
    return {
      passed: false,
      translatedPython: "",
      validationError: formatValidationErrors(validation.issues),
      visibleResults: [],
      hiddenPassedCount: 0,
      hiddenTotal: level.hiddenTests.length,
    };
  }

  let bodyPython = "";

  try {
    const ast = parseAlien(alienSource, lang);
    bodyPython = renderPython(ast);
  } catch (error) {
    return {
      passed: false,
      translatedPython: "",
      parseError: error instanceof Error ? error.message : String(error),
      visibleResults: [],
      hiddenPassedCount: 0,
      hiddenTotal: level.hiddenTests.length,
    };
  }

  const wrappedPython = wrapUserCodeInFunction(bodyPython, level);

  const allTests: LevelTestCase[] = [
    ...level.visibleTests,
    ...level.hiddenTests,
  ];

  const testRun = await testPythonFunction(
    wrappedPython,
    level.functionName,
    allTests.map((test) => ({
      args: test.inputs,
      expected: test.expected,
    })),
  );

  if (testRun.error) {
    return {
      passed: false,
      translatedPython: wrappedPython,
      runtimeError: testRun.error,
      visibleResults: [],
      hiddenPassedCount: 0,
      hiddenTotal: level.hiddenTests.length,
    };
  }

  const visibleResults: SubmissionTestResult[] = [];
  let hiddenPassedCount = 0;

  for (let i = 0; i < allTests.length; i++) {
    const original = allTests[i];
    const result = testRun.results[i];

    const mapped: SubmissionTestResult = {
      passed: result.passed,
      inputs: original.inputs,
      expected: original.expected,
      actual: result.actual,
      visible: original.visible,
      error: result.error,
    };

    if (original.visible) {
      visibleResults.push(mapped);
    } else if (mapped.passed) {
      hiddenPassedCount++;
    }
  }

  const visiblePassed = visibleResults.every((r) => r.passed);
  const hiddenPassed = hiddenPassedCount === level.hiddenTests.length;

  return {
    passed: visiblePassed && hiddenPassed,
    translatedPython: wrappedPython,
    visibleResults,
    hiddenPassedCount,
    hiddenTotal: level.hiddenTests.length,
  };
}