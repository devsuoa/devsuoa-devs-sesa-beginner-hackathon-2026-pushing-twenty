import type { LevelConfig } from "../levels/levelTypes";

function indentPythonBlock(code: string, spaces = 4): string {
  const indent = " ".repeat(spaces);

  return code
    .split("\n")
    .map((line) => (line.trim().length === 0 ? line : indent + line))
    .join("\n");
}

export function wrapUserCodeInFunction(
  userPythonBody: string,
  level: LevelConfig,
): string {
  const header = `def ${level.functionName}(${level.params.join(", ")}):`;

  const trimmedBody = userPythonBody.trim();
  const body =
    trimmedBody.length > 0
      ? indentPythonBlock(trimmedBody)
      : "    pass";

  return `${header}\n${body}`;
}