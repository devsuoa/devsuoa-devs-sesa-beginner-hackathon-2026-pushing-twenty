export type AlienTokenType =
  | "identifier"
  | "number"
  | "string"
  | "operator"
  | "punctuation"
  | "newline";

export interface AlienToken {
  type: AlienTokenType;
  value: string;
  line: number;
  column: number;
}

const TWO_CHAR_OPERATORS = ["==", "!=", "<=", ">="];
const ONE_CHAR_OPERATORS = ["+", "-", "*", "/", "%", "<", ">", "="];
const PUNCTUATION = ["(", ")", "[", "]", "{", "}", ",", ":", "."];

function isWhitespace(ch: string): boolean {
  return ch === " " || ch === "\t" || ch === "\r";
}

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function isIdentifierStart(ch: string): boolean {
  return /[A-Za-z_~!?#^:-]/.test(ch);
}

function isIdentifierPart(ch: string): boolean {
  return /[A-Za-z0-9_~!?#^:-]/.test(ch);
}

export function tokenizeAlienSource(source: string): AlienToken[] {
  const tokens: AlienToken[] = [];

  let i = 0;
  let line = 1;
  let column = 1;

  const pushToken = (type: AlienTokenType, value: string, startLine: number, startColumn: number) => {
    tokens.push({
      type,
      value,
      line: startLine,
      column: startColumn,
    });
  };

  while (i < source.length) {
    const ch = source[i];

    if (ch === "\n") {
      pushToken("newline", "\n", line, column);
      i++;
      line++;
      column = 1;
      continue;
    }

    if (isWhitespace(ch)) {
      i++;
      column++;
      continue;
    }

    // Comments
    if (ch === "#") {
      while (i < source.length && source[i] !== "\n") {
        i++;
        column++;
      }
      continue;
    }

    // Strings
    if (ch === `"` || ch === `'`) {
      const quote = ch;
      const startLine = line;
      const startColumn = column;

      let value = quote;
      i++;
      column++;

      let escaped = false;
      while (i < source.length) {
        const current = source[i];
        value += current;

        i++;
        column++;

        if (current === "\n") {
          line++;
          column = 1;
        }

        if (escaped) {
          escaped = false;
          continue;
        }

        if (current === "\\") {
          escaped = true;
          continue;
        }

        if (current === quote) {
          break;
        }
      }

      pushToken("string", value, startLine, startColumn);
      continue;
    }

    // Two-char operators
    const twoChar = source.slice(i, i + 2);
    if (TWO_CHAR_OPERATORS.includes(twoChar)) {
      pushToken("operator", twoChar, line, column);
      i += 2;
      column += 2;
      continue;
    }

    // One-char operators
    if (ONE_CHAR_OPERATORS.includes(ch)) {
      pushToken("operator", ch, line, column);
      i++;
      column++;
      continue;
    }

    // Punctuation
    if (PUNCTUATION.includes(ch)) {
      pushToken("punctuation", ch, line, column);
      i++;
      column++;
      continue;
    }

    // Numbers
    if (isDigit(ch)) {
      const startLine = line;
      const startColumn = column;

      let value = ch;
      i++;
      column++;

      while (i < source.length && isDigit(source[i])) {
        value += source[i];
        i++;
        column++;
      }

      pushToken("number", value, startLine, startColumn);
      continue;
    }

    // Identifiers / alien words
    if (isIdentifierStart(ch)) {
      const startLine = line;
      const startColumn = column;

      let value = ch;
      i++;
      column++;

      while (i < source.length && isIdentifierPart(source[i])) {
        value += source[i];
        i++;
        column++;
      }

      pushToken("identifier", value, startLine, startColumn);
      continue;
    }

    throw new Error(`Unexpected character "${ch}" at line ${line}, column ${column}`);
  }

  return tokens;
}