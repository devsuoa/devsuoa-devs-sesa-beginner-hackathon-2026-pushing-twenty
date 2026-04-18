import type {
  BinaryOperator,
  BooleanLiteralNode,
  BreakNode,
  CallExprNode,
  ContinueNode,
  ExprNode,
  ExprStatementNode,
  ForNode,
  FunctionDefNode,
  IfNode,
  ProgramNode,
  ReturnNode,
  StatementNode,
  UnaryOperator,
  WhileNode,
} from "../types";
import type { AlienLineToken } from "./tokeniseAlien";
import { tokenisePython } from "./tokenisePython";

class PythonParser {
  private tokens: AlienLineToken[];
  private pos = 0;

  constructor(tokens: AlienLineToken[]) {
    this.tokens = tokens;
  }

  parseProgram(): ProgramNode {
    return {
      type: "Program",
      body: this.parseBlock(0),
    };
  }

  private current(): AlienLineToken | undefined {
    return this.tokens[this.pos];
  }

  private consume(): AlienLineToken {
    const token = this.tokens[this.pos];
    if (!token) {
      throw new Error("Unexpected end of input");
    }
    this.pos++;
    return token;
  }

  private parseBlock(indentLevel: number): StatementNode[] {
    const statements: StatementNode[] = [];

    while (this.pos < this.tokens.length) {
      const token = this.current()!;
      if (token.indentLevel < indentLevel) break;
      if (token.indentLevel > indentLevel) {
        throw new Error(
          `Line ${token.lineNumber}: unexpected indentation level ${token.indentLevel}`,
        );
      }

      statements.push(this.parseStatement(indentLevel));
    }

    return statements;
  }

  private parseStatement(indentLevel: number): StatementNode {
    const token = this.current()!;
    if (token.indentLevel !== indentLevel) {
      throw new Error(
        `Line ${token.lineNumber}: expected indent ${indentLevel}, got ${token.indentLevel}`,
      );
    }

    const line = token.trimmed;

    if (line.startsWith("def ")) return this.parseFunctionDef(indentLevel);
    if (line.startsWith("if ")) return this.parseIf(indentLevel);
    if (line.startsWith("while ")) return this.parseWhile(indentLevel);
    if (line.startsWith("for ")) return this.parseFor(indentLevel);
    if (line.startsWith("return ")) return this.parseReturn();

    if (line === "break") {
      this.consume();
      const node: BreakNode = { type: "Break" };
      return node;
    }

    if (line === "continue") {
      this.consume();
      const node: ContinueNode = { type: "Continue" };
      return node;
    }

    if (this.isAssignmentLine(line)) return this.parseAssign();

    return this.parseExprStatement();
  }

  private parseFunctionDef(indentLevel: number): FunctionDefNode {
    const token = this.consume();
    const line = token.trimmed;

    const match = /^def\s+([A-Za-z_][A-Za-z0-9_]*)\((.*)\):$/.exec(line);
    if (!match) {
      throw new Error(`Line ${token.lineNumber}: invalid function definition`);
    }

    const [, name, paramsText] = match;
    const params = paramsText.trim()
      ? paramsText.split(",").map((p) => p.trim())
      : [];

    const next = this.current();
    if (!next || next.indentLevel !== indentLevel + 1) {
      throw new Error(`Line ${token.lineNumber}: expected indented function body`);
    }

    return {
      type: "FunctionDef",
      name,
      params,
      body: this.parseBlock(indentLevel + 1),
    };
  }

  private parseIf(indentLevel: number): IfNode {
    const first = this.consume();
    const ifMatch = /^if\s+(.+):$/.exec(first.trimmed);
    if (!ifMatch) {
      throw new Error(`Line ${first.lineNumber}: invalid if statement`);
    }

    const next = this.current();
    if (!next || next.indentLevel !== indentLevel + 1) {
      throw new Error(`Line ${first.lineNumber}: expected indented if body`);
    }

    const body = this.parseBlock(indentLevel + 1);
    const elifs: IfNode["elifs"] = [];
    let elseBody: StatementNode[] | null = null;

    while (this.pos < this.tokens.length) {
      const token = this.current()!;
      if (token.indentLevel !== indentLevel) break;

      const line = token.trimmed;

      if (line.startsWith("elif ")) {
        this.consume();
        const elifMatch = /^elif\s+(.+):$/.exec(line);
        if (!elifMatch) {
          throw new Error(`Line ${token.lineNumber}: invalid elif statement`);
        }

        const nextElif = this.current();
        if (!nextElif || nextElif.indentLevel !== indentLevel + 1) {
          throw new Error(`Line ${token.lineNumber}: expected indented elif body`);
        }

        elifs.push({
          test: this.parseExpr(elifMatch[1]),
          body: this.parseBlock(indentLevel + 1),
        });
        continue;
      }

      if (line === "else:") {
        this.consume();

        const nextElse = this.current();
        if (!nextElse || nextElse.indentLevel !== indentLevel + 1) {
          throw new Error(`Line ${token.lineNumber}: expected indented else body`);
        }

        elseBody = this.parseBlock(indentLevel + 1);
      }

      break;
    }

    return {
      type: "If",
      test: this.parseExpr(ifMatch[1]),
      body,
      elifs,
      elseBody,
    };
  }

  private parseWhile(indentLevel: number): WhileNode {
    const token = this.consume();
    const match = /^while\s+(.+):$/.exec(token.trimmed);
    if (!match) {
      throw new Error(`Line ${token.lineNumber}: invalid while statement`);
    }

    const next = this.current();
    if (!next || next.indentLevel !== indentLevel + 1) {
      throw new Error(`Line ${token.lineNumber}: expected indented while body`);
    }

    return {
      type: "While",
      test: this.parseExpr(match[1]),
      body: this.parseBlock(indentLevel + 1),
    };
  }

  private parseFor(indentLevel: number): ForNode {
    const token = this.consume();
    const match = /^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+(.+):$/.exec(token.trimmed);
    if (!match) {
      throw new Error(`Line ${token.lineNumber}: invalid for statement`);
    }

    const [, variable, iterableText] = match;

    const next = this.current();
    if (!next || next.indentLevel !== indentLevel + 1) {
      throw new Error(`Line ${token.lineNumber}: expected indented for body`);
    }

    return {
      type: "For",
      variable,
      iterable: this.parseExpr(iterableText),
      body: this.parseBlock(indentLevel + 1),
    };
  }

  private parseReturn(): ReturnNode {
    const token = this.consume();
    const match = /^return\s+(.+)$/.exec(token.trimmed);
    if (!match) {
      throw new Error(`Line ${token.lineNumber}: invalid return statement`);
    }

    return {
      type: "Return",
      value: this.parseExpr(match[1]),
    };
  }

  private parseAssign() {
    const token = this.consume();
    const idx = token.trimmed.indexOf(" = ");
    if (idx === -1) {
      throw new Error(`Line ${token.lineNumber}: invalid assignment`);
    }

    const target = token.trimmed.slice(0, idx).trim();
    const valueText = token.trimmed.slice(idx + 3).trim();

    return {
      type: "Assign" as const,
      target,
      value: this.parseExpr(valueText),
    };
  }

  private parseExprStatement(): ExprStatementNode {
    const token = this.consume();
    return {
      type: "ExprStatement",
      expression: this.parseExpr(token.trimmed),
    };
  }

  private isAssignmentLine(line: string): boolean {
    return line.includes(" = ") && !line.startsWith("if ") && !line.startsWith("while ");
  }

  private parseExpr(text: string): ExprNode {
    const trimmed = text.trim();

    if (trimmed === "True") {
      const node: BooleanLiteralNode = { type: "BooleanLiteral", value: true };
      return node;
    }

    if (trimmed === "False") {
      const node: BooleanLiteralNode = { type: "BooleanLiteral", value: false };
      return node;
    }

    if (trimmed === "None") {
      return { type: "NoneLiteral" };
    }

    if (/^-?\d+$/.test(trimmed)) {
      return {
        type: "NumberLiteral",
        value: Number(trimmed),
      };
    }

    const call = this.tryParseCall(trimmed);
    if (call) return call;

    const unary = this.tryParseUnary(trimmed);
    if (unary) return unary;

    const binary = this.tryParseBinary(trimmed);
    if (binary) return binary;

    return {
      type: "Identifier",
      name: trimmed,
    };
  }

  private tryParseCall(text: string): CallExprNode | null {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)\((.*)\)$/.exec(text);
    if (!match) return null;

    const [, callee, argsText] = match;
    const args = argsText.trim()
      ? this.splitTopLevelComma(argsText).map((part) => this.parseExpr(part))
      : [];

    return {
      type: "CallExpr",
      callee,
      args,
    };
  }

  private tryParseUnary(text: string): ExprNode | null {
    if (text.startsWith("not ")) {
      return {
        type: "UnaryExpr",
        operator: "not" as UnaryOperator,
        operand: this.parseExpr(text.slice(4)),
      };
    }

    if (text.startsWith("-") && text.length > 1) {
      return {
        type: "UnaryExpr",
        operator: "-" as UnaryOperator,
        operand: this.parseExpr(text.slice(1)),
      };
    }

    return null;
  }

  private tryParseBinary(text: string): ExprNode | null {
    const operatorCandidates: Array<[string, BinaryOperator]> = [
      [" and ", "and"],
      [" or ", "or"],
      [" == ", "=="],
      [" != ", "!="],
      [" <= ", "<="],
      [" >= ", ">="],
      [" < ", "<"],
      [" > ", ">"],
      [" + ", "+"],
      [" - ", "-"],
      [" * ", "*"],
      [" / ", "/"],
      [" % ", "%"],
    ];

    for (const [tokenText, canonicalOp] of operatorCandidates) {
      const index = this.findTopLevelOperator(text, tokenText);
      if (index !== -1) {
        const left = text.slice(0, index).trim();
        const right = text.slice(index + tokenText.length).trim();
        return {
          type: "BinaryExpr",
          operator: canonicalOp,
          left: this.parseExpr(left),
          right: this.parseExpr(right),
        };
      }
    }

    return null;
  }

  private splitTopLevelComma(text: string): string[] {
    const parts: string[] = [];
    let current = "";
    let depth = 0;

    for (const ch of text) {
      if (ch === "(" || ch === "[") depth++;
      else if (ch === ")" || ch === "]") depth--;

      if (ch === "," && depth === 0) {
        parts.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }

    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts;
  }

  private findTopLevelOperator(text: string, operator: string): number {
    let depth = 0;

    for (let i = 0; i <= text.length - operator.length; i++) {
      const ch = text[i];
      if (ch === "(" || ch === "[") depth++;
      else if (ch === ")" || ch === "]") depth--;

      if (depth === 0 && text.slice(i, i + operator.length) === operator) {
        return i;
      }
    }

    return -1;
  }
}

export function parsePython(source: string): ProgramNode {
  const tokens = tokenisePython(source);
  const parser = new PythonParser(tokens);
  return parser.parseProgram();
}