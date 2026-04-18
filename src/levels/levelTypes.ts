export interface LevelTestCase {
  inputs: unknown[];
  expected: unknown;
  visible: boolean;
}

export interface LevelConfig {
  id: string;
  title: string;
  description: string;

  pythonCode: string;

  // Hidden wrapper function name
  functionName: string;

  // Parameters the hidden wrapper function receives
  params: string[];

  // What the user sees
  visibleTests: LevelTestCase[];

  // What the grader uses
  hiddenTests: LevelTestCase[];
}