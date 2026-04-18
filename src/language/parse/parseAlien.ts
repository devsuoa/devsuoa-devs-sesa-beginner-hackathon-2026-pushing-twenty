import type {
  AssignNode,
  BinaryOperator,
  BooleanLiteralNode,
  BreakNode,
  CallExprNode,
  ContinueNode,
  ExprNode,
  ExprStatementNode,
  ForNode,
  FunctionDefNode,
  GeneratedPlanetLanguage,
  IfNode,
  ProgramNode,
  ReturnNode,
  StatementNode,
  UnaryOperator,
  WhileNode,
} from "../types";
import type { AlienLineToken } from "./tokeniseAlien";
import { tokeniseAlien } from "./tokeniseAlien";

class AlienParser {
  private tokens: AlienLineToken[];
  private pos = 0;
  private lang: GeneratedPlanetLanguage;

  constructor(tokens: AlienLineToken[], lang: GeneratedPlanetLanguage) {
    this.tokens = tokens;
    this.lang = lang;
  }

  parseProgram(): ProgramNode {
    const body = this.parseBlock(0);
    return {
      type: "Program",
      body,
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

  private expectIndent(indentLevel: number, token: AlienLineToken): void {
    if (token.indentLevel !== indentLevel) {
      throw new Error(
        `Line ${token.lineNumber}: expected indent ${indentLevel}, got ${token.indentLevel}`,
      );
    }
  }

    private invertRecord(map: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [canonical, alien] of Object.entries(map)) {
      out[alien] = canonical;
    }
    return out;
  }

  private alienToCanonicalOperator(token: string): string {
    const reversed = this.invertRecord(this.lang.operators);
    return reversed[token] ?? token;
  }

  private alienToCanonicalBuiltin(token: string): string {
    const reversed = this.invertRecord(this.lang.builtins);
    return reversed[token] ?? token;
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
    this.expectIndent(indentLevel, token);

    if (this.isFunctionDefLine(token.trimmed)) {
      return this.parseFunctionDef(indentLevel);
    }

    if (this.isIfLine(token.trimmed)) {
      return this.parseIf(indentLevel);
    }

    if (this.isWhileLine(token.trimmed)) {
      return this.parseWhile(indentLevel);
    }

    if (this.isForLine(token.trimmed)) {
      return this.parseFor(indentLevel);
    }

    if (this.isReturnLine(token.trimmed)) {
      return this.parseReturn();
    }

    if (token.trimmed === this.lang.keywords.break) {
      this.consume();
      const node: BreakNode = { type: "Break" };
      return node;
    }

    if (token.trimmed === this.lang.keywords.continue) {
      this.consume();
      const node: ContinueNode = { type: "Continue" };
      return node;
    }

    if (this.isAssignmentLine(token.trimmed)) {
      return this.parseAssign();
    }

    return this.parseExprStatement();
  }

  private blockOpenToken(): string {
    return this.lang.symbols.blockOpenToken ?? "::";
  }

  private blockCloseToken(): string | undefined {
    return this.lang.symbols.blockCloseToken;
  }

  private argOpenToken(): string {
    return this.lang.symbols.argOpenToken;
  }

  private argCloseToken(): string {
    return this.lang.symbols.argCloseToken;
  }

  private mapAlienTokenToCanonical(token: string): string {
    const keywordEntries = Object.entries(this.lang.keywords) as Array<
      [keyof GeneratedPlanetLanguage["keywords"], string]
    >;

    for (const [canonical, alien] of keywordEntries) {
      if (token === alien) return canonical;
    }

    return token;
  }

  private parseFunctionDef(indentLevel: number): FunctionDefNode {
    const token = this.consume();
    const line = token.trimmed;

    let name = "";
    let params: string[] = [];

    if (this.lang.syntax.functionStyle === "keyword_name_square_params_block") {
      const prefix = `${this.lang.keywords.def} `;
      const suffix = ` ${this.blockOpenToken()}`;
      if (!line.startsWith(prefix) || !line.endsWith(suffix)) {
        throw new Error(`Line ${token.lineNumber}: invalid function definition`);
      }

      const middle = line.slice(prefix.length, line.length - suffix.length);
      const openIndex = middle.indexOf("[");
      const closeIndex = middle.lastIndexOf("]");

      if (openIndex === -1 || closeIndex === -1 || closeIndex < openIndex) {
        throw new Error(`Line ${token.lineNumber}: invalid square-bracket params`);
      }

      name = middle.slice(0, openIndex).trim();
      const paramsText = middle.slice(openIndex + 1, closeIndex).trim();
      params = paramsText ? paramsText.split(",").map((p: String) => p.trim()) : [];
    } else if (this.lang.syntax.functionStyle === "make_name_with_params_block") {
      const prefix = "make ";
      const withMarker = " with ";
      const suffix = ` ${this.blockOpenToken()}`;

      if (!line.startsWith(prefix) || !line.endsWith(suffix)) {
        throw new Error(`Line ${token.lineNumber}: invalid make-style function definition`);
      }

      const middle = line.slice(prefix.length, line.length - suffix.length);
      const withIndex = middle.indexOf(withMarker);

      if (withIndex === -1) {
        throw new Error(`Line ${token.lineNumber}: missing 'with' in function definition`);
      }

      name = middle.slice(0, withIndex).trim();
      const paramPart = middle.slice(withIndex + withMarker.length).trim();
      params = this.parseDelimitedParams(paramPart, token.lineNumber);
    } else if (this.lang.syntax.functionStyle === "name_sigil_params_keyword") {
      const suffix = ` => ${this.lang.keywords.def}`;
      const marker = " :: ";

      if (!line.endsWith(suffix)) {
        throw new Error(`Line ${token.lineNumber}: invalid sigil-style function definition`);
      }

      const front = line.slice(0, line.length - suffix.length);
      const markerIndex = front.indexOf(marker);

      if (markerIndex === -1) {
        throw new Error(`Line ${token.lineNumber}: missing '::' in function definition`);
      }

      name = front.slice(0, markerIndex).trim();
      const paramPart = front.slice(markerIndex + marker.length).trim();
      params = this.parseDelimitedParams(paramPart, token.lineNumber);
    } else {
      const prefix = `${this.lang.keywords.def} `;
      const suffix = ` ${this.blockOpenToken()}`;

      if (!line.startsWith(prefix) || !line.endsWith(suffix)) {
        throw new Error(`Line ${token.lineNumber}: invalid function definition`);
      }

      const middle = line.slice(prefix.length, line.length - suffix.length);
      const open = this.argOpenToken();
      const close = this.argCloseToken();
      const openIndex = middle.indexOf(open);
      const closeIndex = middle.lastIndexOf(close);

      if (openIndex === -1 || closeIndex === -1 || closeIndex < openIndex) {
        throw new Error(`Line ${token.lineNumber}: invalid parameter list`);
      }

      name = middle.slice(0, openIndex).trim();
      const paramsText = middle.slice(openIndex + open.length, closeIndex).trim();
      params = paramsText ? paramsText.split(",").map((p: String) => p.trim()) : [];
    }

    const body = this.parseIndentedOrDelimitedBody(indentLevel, token.lineNumber);

    return {
      type: "FunctionDef",
      name,
      params,
      body,
    };
  }

  private parseIf(indentLevel: number): IfNode {
    const first = this.consume();
    const test = this.parseConditionFromLine(first.trimmed, "if", first.lineNumber);
    const body = this.parseIndentedOrDelimitedBody(indentLevel, first.lineNumber);

    const elifs: IfNode["elifs"] = [];
    let elseBody: StatementNode[] | null = null;

    while (this.pos < this.tokens.length) {
      const next = this.current()!;
      if (next.indentLevel !== indentLevel) break;

      if (this.isElifLine(next.trimmed)) {
        const elifToken = this.consume();
        const elifTest = this.parseConditionFromLine(
          elifToken.trimmed,
          "elif",
          elifToken.lineNumber,
        );
        const elifBody = this.parseIndentedOrDelimitedBody(indentLevel, elifToken.lineNumber);
        elifs.push({
          test: elifTest,
          body: elifBody,
        });
        continue;
      }

      if (this.isElseLine(next.trimmed)) {
        this.consume();
        elseBody = this.parseIndentedOrDelimitedBody(indentLevel, next.lineNumber);
      }

      break;
    }

    return {
      type: "If",
      test,
      body,
      elifs,
      elseBody,
    };
  }

  private parseWhile(indentLevel: number): WhileNode {
    const token = this.consume();
    const test = this.parseConditionFromLine(token.trimmed, "while", token.lineNumber);
    const body = this.parseIndentedOrDelimitedBody(indentLevel, token.lineNumber);

    return {
      type: "While",
      test,
      body,
    };
  }

  private parseFor(indentLevel: number): ForNode {
    const token = this.consume();
    const line = token.trimmed;
    const blockOpen = this.blockOpenToken();

    let variable = "";
    let iterableText = "";

    if (this.lang.syntax.forStyle === "for_paren_var_in_iter") {
      const prefix = `${this.lang.keywords.for} (`;
      const suffix = `) ${blockOpen}`;

      if (!line.startsWith(prefix) || !line.endsWith(suffix)) {
        throw new Error(`Line ${token.lineNumber}: invalid for-loop`);
      }

      const middle = line.slice(prefix.length, line.length - suffix.length);
      const inMarker = ` ${this.lang.keywords.in} `;
      const inIndex = middle.indexOf(inMarker);

      if (inIndex === -1) {
        throw new Error(`Line ${token.lineNumber}: missing 'in' in for-loop`);
      }

      variable = middle.slice(0, inIndex).trim();
      iterableText = middle.slice(inIndex + inMarker.length).trim();
    } else if (this.lang.syntax.forStyle === "for_iter_as_var") {
      const prefix = `${this.lang.keywords.for} `;
      const suffix = ` ${blockOpen}`;
      const asMarker = " as ";

      if (!line.startsWith(prefix) || !line.endsWith(suffix)) {
        throw new Error(`Line ${token.lineNumber}: invalid for-loop`);
      }

      const middle = line.slice(prefix.length, line.length - suffix.length);
      const asIndex = middle.lastIndexOf(asMarker);

      if (asIndex === -1) {
        throw new Error(`Line ${token.lineNumber}: missing 'as' in for-loop`);
      }

      iterableText = middle.slice(0, asIndex).trim();
      variable = middle.slice(asIndex + asMarker.length).trim();
    } else {
      const prefix = `${this.lang.keywords.for} `;
      const suffix = ` ${blockOpen}`;
      const inMarker = ` ${this.lang.keywords.in} `;

      if (!line.startsWith(prefix) || !line.endsWith(suffix)) {
        throw new Error(`Line ${token.lineNumber}: invalid for-loop`);
      }

      const middle = line.slice(prefix.length, line.length - suffix.length);
      const inIndex = middle.indexOf(inMarker);

      if (inIndex === -1) {
        throw new Error(`Line ${token.lineNumber}: missing 'in' in for-loop`);
      }

      variable = middle.slice(0, inIndex).trim();
      iterableText = middle.slice(inIndex + inMarker.length).trim();
    }

    const body = this.parseIndentedOrDelimitedBody(indentLevel, token.lineNumber);

    return {
      type: "For",
      variable,
      iterable: this.parseExpr(iterableText),
      body,
    };
  }

  private parseReturn(): ReturnNode {
    const token = this.consume();
    const prefix = `${this.lang.keywords.return} `;
    if (!token.trimmed.startsWith(prefix)) {
      throw new Error(`Line ${token.lineNumber}: invalid return statement`);
    }

    const exprText = token.trimmed.slice(prefix.length).trim();
    return {
      type: "Return",
      value: this.parseExpr(exprText),
    };
  }

  private parseAssign(): AssignNode {
    const token = this.consume();
    const line = token.trimmed;
    const word = this.lang.symbols.assignmentWord ?? "set";

    if (this.lang.syntax.assignmentStyle === "put_in") {
      const prefix = "put ";
      const marker = " in ";

      if (!line.startsWith(prefix)) {
        throw new Error(`Line ${token.lineNumber}: invalid put-in assignment`);
      }

      const middle = line.slice(prefix.length);
      const markerIndex = middle.lastIndexOf(marker);

      if (markerIndex === -1) {
        throw new Error(`Line ${token.lineNumber}: invalid put-in assignment`);
      }

      const valueText = middle.slice(0, markerIndex).trim();
      const target = middle.slice(markerIndex + marker.length).trim();

      return {
        type: "Assign",
        target,
        value: this.parseExpr(valueText),
      };
    }

    if (this.lang.syntax.assignmentStyle === "set_prefix") {
      const prefix = "set ";
      const marker = " = ";

      if (!line.startsWith(prefix)) {
        throw new Error(`Line ${token.lineNumber}: invalid set assignment`);
      }

      const middle = line.slice(prefix.length);
      const markerIndex = middle.indexOf(marker);

      if (markerIndex === -1) {
        throw new Error(`Line ${token.lineNumber}: invalid set assignment`);
      }

      const target = middle.slice(0, markerIndex).trim();
      const valueText = middle.slice(markerIndex + marker.length).trim();

      return {
        type: "Assign",
        target,
        value: this.parseExpr(valueText),
      };
    }

    if (this.lang.syntax.assignmentStyle === "word_prefix") {
      const prefix = `${word} `;
      if (!line.startsWith(prefix)) {
        throw new Error(`Line ${token.lineNumber}: invalid prefix assignment`);
      }

      const rest = line.slice(prefix.length).trim();
      const firstSpace = rest.indexOf(" ");

      if (firstSpace === -1) {
        throw new Error(`Line ${token.lineNumber}: invalid prefix assignment`);
      }

      const target = rest.slice(0, firstSpace).trim();
      const valueText = rest.slice(firstSpace + 1).trim();

      return {
        type: "Assign",
        target,
        value: this.parseExpr(valueText),
      };
    }

    if (this.lang.syntax.assignmentStyle === "word_suffix") {
      const suffix = ` ${word}`;
      if (!line.endsWith(suffix)) {
        throw new Error(`Line ${token.lineNumber}: invalid suffix assignment`);
      }

      const middle = line.slice(0, line.length - suffix.length).trim();
      const firstSpace = middle.indexOf(" ");

      if (firstSpace === -1) {
        throw new Error(`Line ${token.lineNumber}: invalid suffix assignment`);
      }

      const target = middle.slice(0, firstSpace).trim();
      const valueText = middle.slice(firstSpace + 1).trim();

      return {
        type: "Assign",
        target,
        value: this.parseExpr(valueText),
      };
    }

    if (this.lang.syntax.assignmentStyle === "word_infix") {
      const marker = ` ${word} `;
      const markerIndex = line.indexOf(marker);

      if (markerIndex === -1) {
        throw new Error(`Line ${token.lineNumber}: invalid infix assignment`);
      }

      const target = line.slice(0, markerIndex).trim();
      const valueText = line.slice(markerIndex + marker.length).trim();

      return {
        type: "Assign",
        target,
        value: this.parseExpr(valueText),
      };
    }

    const tokenText =
      this.lang.syntax.assignmentStyle === "arrow"
        ? ` ${this.lang.symbols.assignmentToken ?? "<-"} `
        : " = ";

    const markerIndex = line.indexOf(tokenText);
    if (markerIndex === -1) {
      throw new Error(`Line ${token.lineNumber}: invalid assignment`);
    }

    const target = line.slice(0, markerIndex).trim();
    const valueText = line.slice(markerIndex + tokenText.length).trim();

    return {
      type: "Assign",
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

  private parseIndentedOrDelimitedBody(indentLevel: number, lineNumber: number): StatementNode[] {
    if (this.lang.syntax.blockStyle === "indent" || this.lang.syntax.blockStyle === "arrow_indent") {
      const next = this.current();
      if (!next || next.indentLevel !== indentLevel + 1) {
        throw new Error(`Line ${lineNumber}: expected indented block`);
      }
      return this.parseBlock(indentLevel + 1);
    }

    if (this.lang.syntax.blockStyle === "then_end" || this.lang.syntax.blockStyle === "brace") {
      const body = this.parseBlock(indentLevel + 1);
      const closeToken = this.current();
      const expected = this.blockCloseToken();

      if (!closeToken || closeToken.indentLevel !== indentLevel || closeToken.trimmed !== expected) {
        throw new Error(`Line ${lineNumber}: expected block close token "${expected}"`);
      }

      this.consume();
      return body;
    }

    throw new Error(`Unsupported block style: ${this.lang.syntax.blockStyle}`);
  }

  private parseDelimitedParams(paramText: string, lineNumber: number): string[] {
    const open = this.argOpenToken();
    const close = this.argCloseToken();

    if (!paramText.startsWith(open) || !paramText.endsWith(close)) {
      throw new Error(`Line ${lineNumber}: invalid parameter list`);
    }

    const inner = paramText.slice(open.length, paramText.length - close.length).trim();
    return inner ? inner.split(",").map((p) => p.trim()) : [];
  }

  private parseConditionFromLine(
    line: string,
    kind: "if" | "elif" | "while",
    lineNumber: number,
  ): ExprNode {
    const blockOpen = this.blockOpenToken();

    if (this.lang.syntax.conditionalStyle === "when_expr_then") {
      const keyword =
        kind === "if"
          ? "when"
          : kind === "elif"
          ? "when"
          : this.lang.keywords.while;

      if (kind === "while") {
        const prefix = `${this.lang.keywords.while} `;
        const suffix = ` ${blockOpen}`;
        if (!line.startsWith(prefix) || !line.endsWith(suffix)) {
          throw new Error(`Line ${lineNumber}: invalid while condition`);
        }
        return this.parseExpr(line.slice(prefix.length, line.length - suffix.length).trim());
      }

      if (!line.startsWith("when ") || !line.endsWith(" then")) {
        throw new Error(`Line ${lineNumber}: invalid conditional`);
      }

      return this.parseExpr(line.slice("when ".length, line.length - " then".length).trim());
    }

    if (this.lang.syntax.conditionalStyle === "sigil_expr_block") {
      const sigil = kind === "if" ? "?" : this.lang.keywords.elif;
      const prefix = `${sigil} `;
      const suffix = ` ${blockOpen}`;

      if (!line.startsWith(prefix) || !line.endsWith(suffix)) {
        throw new Error(`Line ${lineNumber}: invalid sigil conditional`);
      }

      return this.parseExpr(line.slice(prefix.length, line.length - suffix.length).trim());
    }

    if (this.lang.syntax.conditionalStyle === "keyword_paren_expr_block") {
      const keyword =
        kind === "if"
          ? this.lang.keywords.if
          : kind === "elif"
          ? this.lang.keywords.elif
          : this.lang.keywords.while;

      const prefix = `${keyword} (`;
      const suffix = `) ${blockOpen}`;

      if (!line.startsWith(prefix) || !line.endsWith(suffix)) {
        throw new Error(`Line ${lineNumber}: invalid parenthesized conditional`);
      }

      return this.parseExpr(line.slice(prefix.length, line.length - suffix.length).trim());
    }

    const keyword =
      kind === "if"
        ? this.lang.keywords.if
        : kind === "elif"
        ? this.lang.keywords.elif
        : this.lang.keywords.while;

    const prefix = `${keyword} `;
    const suffix = ` ${blockOpen}`;

    if (!line.startsWith(prefix) || !line.endsWith(suffix)) {
      throw new Error(`Line ${lineNumber}: invalid conditional`);
    }

    return this.parseExpr(line.slice(prefix.length, line.length - suffix.length).trim());
  }

  private isFunctionDefLine(line: string): boolean {
    if (this.lang.syntax.functionStyle === "make_name_with_params_block") {
      return line.startsWith("make ");
    }
    if (this.lang.syntax.functionStyle === "name_sigil_params_keyword") {
      return line.endsWith(` => ${this.lang.keywords.def}`);
    }
    return line.startsWith(`${this.lang.keywords.def} `);
  }

  private isIfLine(line: string): boolean {
    if (this.lang.syntax.conditionalStyle === "when_expr_then") {
      return line.startsWith("when ") && line.endsWith(" then");
    }
    if (this.lang.syntax.conditionalStyle === "sigil_expr_block") {
      return line.startsWith("? ");
    }
    return line.startsWith(`${this.lang.keywords.if} `);
  }

  private isElifLine(line: string): boolean {
    if (this.lang.syntax.conditionalStyle === "when_expr_then") {
      return line.startsWith("when ") && line.endsWith(" then");
    }
    return line.startsWith(`${this.lang.keywords.elif} `);
  }

  private isElseLine(line: string): boolean {
    if (this.lang.syntax.elseStyle === "otherwise_then") {
      return line === "otherwise then";
    }
    if (this.lang.syntax.elseStyle === "sigil_block") {
      return line.startsWith("~ ");
    }
    return line.startsWith(`${this.lang.keywords.else}`);
  }

  private isWhileLine(line: string): boolean {
    return line.startsWith(`${this.lang.keywords.while} `);
  }

  private isForLine(line: string): boolean {
    return line.startsWith(`${this.lang.keywords.for} `);
  }

  private isReturnLine(line: string): boolean {
    return line.startsWith(`${this.lang.keywords.return} `);
  }

  private isAssignmentLine(line: string): boolean {
    if (this.lang.syntax.assignmentStyle === "put_in") {
      return line.startsWith("put ");
    }

    if (this.lang.syntax.assignmentStyle === "set_prefix") {
      return line.startsWith("set ");
    }

    if (this.lang.syntax.assignmentStyle === "arrow") {
      return line.includes(` ${this.lang.symbols.assignmentToken ?? "<-"} `);
    }

    if (this.lang.syntax.assignmentStyle === "equals") {
      return line.includes(" = ");
    }

    if (this.lang.syntax.assignmentStyle === "word_infix") {
      return line.includes(` ${this.lang.symbols.assignmentWord} `);
    }

    if (this.lang.syntax.assignmentStyle === "word_prefix") {
      return line.startsWith(`${this.lang.symbols.assignmentWord} `);
    }

    if (this.lang.syntax.assignmentStyle === "word_suffix") {
      return line.endsWith(` ${this.lang.symbols.assignmentWord}`);
    }

    return false;
  }

  private parseExpr(text: string): ExprNode {
    const trimmed = text.trim();

    if (trimmed === this.lang.keywords.True) {
      const node: BooleanLiteralNode = { type: "BooleanLiteral", value: true };
      return node;
    }

    if (trimmed === this.lang.keywords.False) {
      const node: BooleanLiteralNode = { type: "BooleanLiteral", value: false };
      return node;
    }

    if (trimmed === this.lang.keywords.None) {
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
    const open = this.argOpenToken();
    const close = this.argCloseToken();

    const openIndex = text.indexOf(open);
    const closeIndex = text.lastIndexOf(close);

    if (openIndex <= 0 || closeIndex !== text.length - close.length) {
      return null;
    }

    const rawCallee = text.slice(0, openIndex).trim();
    const callee = this.alienToCanonicalBuiltin(rawCallee);
    const argsText = text.slice(openIndex + open.length, closeIndex).trim();

    const args = argsText
      ? this.splitTopLevelComma(argsText).map((part) => this.parseExpr(part))
      : [];

    return {
      type: "CallExpr",
      callee,
      args,
    };
  }

  private tryParseUnary(text: string): ExprNode | null {
    const notPrefix = `${this.lang.operators.not} `;
    if (text.startsWith(notPrefix)) {
      return {
        type: "UnaryExpr",
        operator: "not" as UnaryOperator,
        operand: this.parseExpr(text.slice(notPrefix.length)),
      };
    }

    const minusToken = this.lang.operators["-"];
    if (text.startsWith(minusToken) && text.length > minusToken.length) {
      return {
        type: "UnaryExpr",
        operator: "-" as UnaryOperator,
        operand: this.parseExpr(text.slice(minusToken.length)),
      };
    }

    return null;
  }

    private tryParseBinary(text: string): ExprNode | null {
    const operatorCandidates: Array<[string, BinaryOperator]> = [
      [` ${this.lang.operators.and} `, "and"],
      [` ${this.lang.operators.or} `, "or"],
      [` ${this.lang.operators["=="]} `, "=="],
      [` ${this.lang.operators["!="]} `, "!="],
      [` ${this.lang.operators["<="]} `, "<="],
      [` ${this.lang.operators[">="]} `, ">="],
      [` ${this.lang.operators["<"]} `, "<"],
      [` ${this.lang.operators[">"]} `, ">"],
      [` ${this.lang.operators["+"]} `, "+"],
      [` ${this.lang.operators["-"]} `, "-"],
      [` ${this.lang.operators["*"]} `, "*"],
      [` ${this.lang.operators["/"]} `, "/"],
      [` ${this.lang.operators["%"]} `, "%"],
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

    const openChars = new Set(["(", "["]);
    const closeChars = new Set([")", "]"]);

    for (const ch of text) {
      if (openChars.has(ch)) depth++;
      else if (closeChars.has(ch)) depth--;

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

export function parseAlien(
  source: string,
  lang: GeneratedPlanetLanguage,
): ProgramNode {
  const tokens = tokeniseAlien(source, lang);
  const parser = new AlienParser(tokens, lang);
  return parser.parseProgram();
}