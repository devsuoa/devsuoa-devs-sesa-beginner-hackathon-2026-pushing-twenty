import type { GeneratedPlanetLanguage } from "../types";
import { tokenizeAlienSource, type AlienToken } from "./tokenizeAlienSource";

export interface AlienSourceValidationIssue {
  line: number;
  column: number;
  message: string;
  token: string;
}

export interface AlienSourceValidationResult {
  isValid: boolean;
  issues: AlienSourceValidationIssue[];
}

const CANONICAL_PYTHON_KEYWORDS = [
  "def",
  "return",
  "if",
  "elif",
  "else",
  "for",
  "while",
  "in",
  "break",
  "continue",
  "True",
  "False",
  "None",
  "and",
  "or",
  "not",
];

const CANONICAL_PYTHON_BUILTINS = [
  "print",
  "len",
  "range",
];

const CANONICAL_SYMBOL_OPERATORS = [
  "==",
  "!=",
  "<=",
  ">=",
  "<",
  ">",
  "+",
  "-",
  "*",
  "/",
  "%",
];

function makeIssue(token: AlienToken, message: string): AlienSourceValidationIssue {
  return {
    line: token.line,
    column: token.column,
    token: token.value,
    message,
  };
}

function buildReservedIdentifierSet(lang: GeneratedPlanetLanguage): Set<string> {
  const reserved = new Set<string>();

  // Canonical Python words are always reserved as identifiers.
  for (const kw of CANONICAL_PYTHON_KEYWORDS) reserved.add(kw);
  for (const builtin of CANONICAL_PYTHON_BUILTINS) reserved.add(builtin);

  // Current planet's alien keywords / builtins are also reserved.
  for (const kw of Object.values(lang.keywords)) reserved.add(kw);
  for (const builtin of Object.values(lang.builtins)) reserved.add(builtin);

  // Any word-like operators should also be reserved as identifiers.
  for (const op of Object.values(lang.operators)) {
    if (/^[A-Za-z_~!?#^:-][A-Za-z0-9_~!?#^:-]*$/.test(op)) {
      reserved.add(op);
    }
  }

  // Assignment word can also be reserved if present.
  if (lang.symbols.assignmentWord) {
    reserved.add(lang.symbols.assignmentWord);
  }

  return reserved;
}

function isWordLikeIdentifier(value: string): boolean {
  return /^[A-Za-z_~!?#^:-][A-Za-z0-9_~!?#^:-]*$/.test(value);
}

function looksLikeDefinitionContext(
  tokens: AlienToken[],
  index: number,
  lang: GeneratedPlanetLanguage,
): boolean {
  const token = tokens[index];
  const prev = tokens[index - 1];
  const next = tokens[index + 1];

  // Function name after def-like keyword
  if (prev && prev.type === "identifier" && prev.value === lang.keywords.def) {
    return true;
  }

  // Assignment target patterns
  switch (lang.syntax.assignmentStyle) {
    case "equals":
    case "arrow":
    case "word_infix":
      if (next && next.type === "operator") {
        return false;
      }
      if (
        next &&
        (
          (lang.syntax.assignmentStyle === "equals" && next.value === "=") ||
          (lang.syntax.assignmentStyle === "arrow" && next.value === (lang.symbols.assignmentToken ?? "<-"))
        )
      ) {
        return true;
      }
      if (
        lang.syntax.assignmentStyle === "word_infix" &&
        next &&
        next.type === "identifier" &&
        next.value === lang.symbols.assignmentWord
      ) {
        return true;
      }
      break;

    case "word_prefix":
      if (
        prev &&
        prev.type === "identifier" &&
        prev.value === lang.symbols.assignmentWord
      ) {
        return true;
      }
      break;

    case "word_suffix":
      if (
        next &&
        next.type !== "newline" &&
        tokens[index + 2] &&
        tokens[index + 2].type === "identifier" &&
        tokens[index + 2].value === lang.symbols.assignmentWord
      ) {
        return true;
      }
      break;

    case "set_prefix":
      if (prev && prev.type === "identifier" && prev.value === "set") {
        return true;
      }
      break;

    case "put_in":
      // target comes after "in"
      if (prev && prev.type === "identifier" && prev.value === "in") {
        return true;
      }
      break;
  }

  return false;
}

export function validateAlienSource(
  source: string,
  lang: GeneratedPlanetLanguage,
): AlienSourceValidationResult {
  const tokens = tokenizeAlienSource(source);
  const issues: AlienSourceValidationIssue[] = [];

  const allowedKeywordTokens = new Set(Object.values(lang.keywords));
  const allowedBuiltinTokens = new Set(Object.values(lang.builtins));
  const allowedOperatorTokens = new Set(Object.values(lang.operators));
  const reservedIdentifiers = buildReservedIdentifierSet(lang);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "string" || token.type === "newline") {
      continue;
    }

    if (token.type === "identifier") {
      if (
        CANONICAL_PYTHON_KEYWORDS.includes(token.value) &&
        !allowedKeywordTokens.has(token.value)
      ) {
        issues.push(
          makeIssue(
            token,
            `Raw Python keyword "${token.value}" is not allowed on this planet.`,
          ),
        );
        continue;
      }

      if (
        CANONICAL_PYTHON_BUILTINS.includes(token.value) &&
        !allowedBuiltinTokens.has(token.value)
      ) {
        issues.push(
          makeIssue(
            token,
            `Raw Python builtin "${token.value}" is not allowed on this planet.`,
          ),
        );
        continue;
      }

      if (
        isWordLikeIdentifier(token.value) &&
        reservedIdentifiers.has(token.value) &&
        looksLikeDefinitionContext(tokens, i, lang)
      ) {
        issues.push(
          makeIssue(
            token,
            `"${token.value}" is reserved and cannot be used as a variable or function name on this planet.`,
          ),
        );
        continue;
      }
    }

    if (token.type === "operator") {
      if (
        CANONICAL_SYMBOL_OPERATORS.includes(token.value) &&
        !allowedOperatorTokens.has(token.value)
      ) {
        issues.push(
          makeIssue(
            token,
            `Raw Python operator "${token.value}" is not allowed on this planet.`,
          ),
        );
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}