import type { GeneratedPlanetLanguage } from "../types";

export interface AlienLineToken {
  raw: string;
  trimmed: string;
  indentLevel: number;
  lineNumber: number;
}

const INDENT_WIDTH = 4;

export function countIndentLevel(line: string): number {
  let spaces = 0;
  for (const ch of line) {
    if (ch === " ") spaces++;
    else break;
  }

  if (spaces % INDENT_WIDTH !== 0) {
    throw new Error(
      `Invalid indentation: expected multiples of ${INDENT_WIDTH} spaces, got ${spaces}`,
    );
  }

  return spaces / INDENT_WIDTH;
}

function isIgnorableLine(trimmed: string): boolean {
  return trimmed.length === 0 || trimmed.startsWith("#");
}

export function tokeniseAlien(
  source: string,
  _lang: GeneratedPlanetLanguage,
): AlienLineToken[] {
  const normalized = source.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  const tokens: AlienLineToken[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (isIgnorableLine(trimmed)) continue;

    tokens.push({
      raw,
      trimmed,
      indentLevel: countIndentLevel(raw),
      lineNumber: i + 1,
    });
  }

  return tokens;
}