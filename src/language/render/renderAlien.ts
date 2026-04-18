import type {
  AssignNode,
  BinaryExprNode,
  BooleanLiteralNode,
  BreakNode,
  CallExprNode,
  ContinueNode,
  ExprNode,
  ExprStatementNode,
  ForNode,
  FunctionDefNode,
  GeneratedPlanetLanguage,
  IdentifierNode,
  IfNode,
  IndexExprNode,
  ListLiteralNode,
  NoneLiteralNode,
  NumberLiteralNode,
  ProgramNode,
  ReturnNode,
  StatementNode,
  StringLiteralNode,
  UnaryExprNode,
  WhileNode,
} from "../types";

const INDENT = "    ";

function indentLine(level: number, text: string): string {
  return `${INDENT.repeat(level)}${text}`;
}

function kw(lang: GeneratedPlanetLanguage, key: keyof GeneratedPlanetLanguage["keywords"]): string {
  return lang.keywords[key];
}

function opToken(
  lang: GeneratedPlanetLanguage,
  operator: string,
): string {
  return lang.operators[operator as keyof typeof lang.operators] ?? operator;
}

function builtinToken(
  lang: GeneratedPlanetLanguage,
  name: string,
): string {
  return lang.builtins[name as keyof typeof lang.builtins] ?? name;
}

function blockOpen(lang: GeneratedPlanetLanguage): string {
  return lang.symbols.blockOpenToken ?? "::";
}

function argOpen(lang: GeneratedPlanetLanguage): string {
  return lang.symbols.argOpenToken;
}

function argClose(lang: GeneratedPlanetLanguage): string {
  return lang.symbols.argCloseToken;
}

function assignToken(lang: GeneratedPlanetLanguage): string {
  return lang.symbols.assignmentToken ?? "=";
}

function renderIdentifier(
  node: IdentifierNode,
  lang: GeneratedPlanetLanguage,
): string {
  const mode = lang.cosmetic.identifierTransform;

  if (mode === "upper") return node.name.toUpperCase();
  if (mode === "lower") return node.name.toLowerCase();
  return node.name;
}

function renderNumberLiteral(node: NumberLiteralNode): string {
  return String(node.value);
}

function renderBooleanLiteral(
  node: BooleanLiteralNode,
  lang: GeneratedPlanetLanguage,
): string {
  return node.value ? kw(lang, "True") : kw(lang, "False");
}

function renderNoneLiteral(lang: GeneratedPlanetLanguage): string {
  return kw(lang, "None");
}

function renderCallExpr(node: CallExprNode, lang: GeneratedPlanetLanguage): string {
  const args = node.args.map((arg) => renderExpr(arg, lang)).join(", ");
  const callee = builtinToken(lang, node.callee);
  return `${callee}${argOpen(lang)}${args}${argClose(lang)}`;
}

function renderUnaryExpr(node: UnaryExprNode, lang: GeneratedPlanetLanguage): string {
  if (node.operator === "not") {
    return `${opToken(lang, "not")} ${renderExpr(node.operand, lang)}`;
  }
  return `${opToken(lang, node.operator)}${renderExpr(node.operand, lang)}`;
}

function renderBinaryExpr(node: BinaryExprNode, lang: GeneratedPlanetLanguage): string {
  const op = opToken(lang, node.operator);
  return `${renderExpr(node.left, lang)} ${op} ${renderExpr(node.right, lang)}`;
}

export function renderExpr(node: ExprNode, lang: GeneratedPlanetLanguage): string {
  switch (node.type) {
    case "Identifier":
      return renderIdentifier(node, lang);
    case "NumberLiteral":
      return renderNumberLiteral(node);
    case "BooleanLiteral":
      return renderBooleanLiteral(node, lang);
    case "NoneLiteral":
      return renderNoneLiteral(lang);
    case "StringLiteral":
      return renderStringLiteral(node);
    case "ListLiteral":
      return renderListLiteral(node, lang);
    case "IndexExpr":
      return renderIndexExpr(node, lang);
    case "BinaryExpr":
      return renderBinaryExpr(node, lang);
    case "UnaryExpr":
      return renderUnaryExpr(node, lang);
    case "CallExpr":
      return renderCallExpr(node, lang);
    default: {
      const _exhaustive: never = node;
      throw new Error(`Unhandled expression node: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

function renderAssignmentText(
  node: AssignNode,
  lang: GeneratedPlanetLanguage,
): string {
  const rhs = renderExpr(node.value, lang);
  const word = assignmentWord(lang);

  switch (lang.syntax.assignmentStyle) {
    case "equals":
      return `${node.target} = ${rhs}`;
    case "arrow":
      return `${node.target} ${assignToken(lang)} ${rhs}`;
    case "set_prefix":
      return `set ${node.target} = ${rhs}`;
    case "put_in":
      return `put ${rhs} in ${node.target}`;
    case "word_infix":
      return `${node.target} ${word} ${rhs}`;
    case "word_prefix":
      return `${word} ${node.target} ${rhs}`;
    case "word_suffix":
      return `${node.target} ${rhs} ${word}`;
    default:
      return `${node.target} = ${rhs}`;
  }
}

function assignmentWord(lang: GeneratedPlanetLanguage): string {
  return lang.symbols.assignmentWord ?? "set";
}

function renderAssign(
  node: AssignNode,
  lang: GeneratedPlanetLanguage,
  indentLevel: number,
): string {
  return indentLine(indentLevel, renderAssignmentText(node, lang));
}

function renderReturn(
  node: ReturnNode,
  lang: GeneratedPlanetLanguage,
  indentLevel: number,
): string {
  return indentLine(indentLevel, `${kw(lang, "return")} ${renderExpr(node.value, lang)}`);
}

function renderBreak(
  _node: BreakNode,
  lang: GeneratedPlanetLanguage,
  indentLevel: number,
): string {
  return indentLine(indentLevel, kw(lang, "break"));
}

function renderContinue(
  _node: ContinueNode,
  lang: GeneratedPlanetLanguage,
  indentLevel: number,
): string {
  return indentLine(indentLevel, kw(lang, "continue"));
}

function renderExprStatement(
  node: ExprStatementNode,
  lang: GeneratedPlanetLanguage,
  indentLevel: number,
): string {
  return indentLine(indentLevel, renderExpr(node.expression, lang));
}

function renderFunctionHeader(
  node: FunctionDefNode,
  lang: GeneratedPlanetLanguage,
): string {
  const params = node.params.join(", ");

  switch (lang.syntax.functionStyle) {
    case "keyword_name_params_block":
      return `${kw(lang, "def")} ${node.name}${argOpen(lang)}${params}${argClose(lang)} ${blockOpen(lang)}`;
    case "keyword_name_square_params_block":
      return `${kw(lang, "def")} ${node.name}[${params}] ${blockOpen(lang)}`;
    case "name_sigil_params_keyword":
      return `${node.name} :: ${argOpen(lang)}${params}${argClose(lang)} => ${kw(lang, "def")}`;
    case "make_name_with_params_block":
      return `make ${node.name} with ${argOpen(lang)}${params}${argClose(lang)} ${blockOpen(lang)}`;
    default:
      return `${kw(lang, "def")} ${node.name}${argOpen(lang)}${params}${argClose(lang)} ${blockOpen(lang)}`;
  }
}

function renderFunctionDef(
  node: FunctionDefNode,
  lang: GeneratedPlanetLanguage,
  indentLevel: number,
): string {
  const header = indentLine(indentLevel, renderFunctionHeader(node, lang));
  const body =
    node.body.length > 0
      ? node.body.map((stmt) => renderStatement(stmt, lang, indentLevel + 1)).join("\n")
      : indentLine(indentLevel + 1, "# empty");

  if (lang.syntax.blockStyle === "then_end") {
    return `${header}\n${body}\n${indentLine(indentLevel, lang.symbols.blockCloseToken ?? "end")}`;
  }

  if (lang.syntax.blockStyle === "brace") {
    return `${header}\n${body}\n${indentLine(indentLevel, lang.symbols.blockCloseToken ?? "}")}`;
  }

  return `${header}\n${body}`;
}

function renderIfHeader(node: IfNode, lang: GeneratedPlanetLanguage): string {
  const expr = renderExpr(node.test, lang);

  switch (lang.syntax.conditionalStyle) {
    case "keyword_expr_block":
      return `${kw(lang, "if")} ${expr} ${blockOpen(lang)}`;
    case "keyword_paren_expr_block":
      return `${kw(lang, "if")} (${expr}) ${blockOpen(lang)}`;
    case "when_expr_then":
      return `when ${expr} then`;
    case "sigil_expr_block":
      return `? ${expr} ${blockOpen(lang)}`;
    default:
      return `${kw(lang, "if")} ${expr} ${blockOpen(lang)}`;
  }
}

function renderElseHeader(lang: GeneratedPlanetLanguage): string {
  switch (lang.syntax.elseStyle) {
    case "keyword_block":
      return `${kw(lang, "else")} ${blockOpen(lang)}`;
    case "keyword_spaced_block":
      return `${kw(lang, "else")} ${blockOpen(lang)}`;
    case "otherwise_then":
      return "otherwise then";
    case "sigil_block":
      return `~ ${blockOpen(lang)}`;
    default:
      return `${kw(lang, "else")} ${blockOpen(lang)}`;
  }
}

function renderIf(node: IfNode, lang: GeneratedPlanetLanguage, indentLevel: number): string {
  const parts: string[] = [];

  parts.push(indentLine(indentLevel, renderIfHeader(node, lang)));
  parts.push(
    node.body.length > 0
      ? node.body.map((stmt) => renderStatement(stmt, lang, indentLevel + 1)).join("\n")
      : indentLine(indentLevel + 1, "# empty"),
  );

  for (const elifBranch of node.elifs) {
    const elifHeader =
      lang.syntax.conditionalStyle === "when_expr_then"
        ? `when ${renderExpr(elifBranch.test, lang)} then`
        : `${kw(lang, "elif")} ${renderExpr(elifBranch.test, lang)} ${blockOpen(lang)}`;

    parts.push(indentLine(indentLevel, elifHeader));
    parts.push(
      elifBranch.body.length > 0
        ? elifBranch.body
            .map((stmt) => renderStatement(stmt, lang, indentLevel + 1))
            .join("\n")
        : indentLine(indentLevel + 1, "# empty"),
    );
  }

  if (node.elseBody) {
    parts.push(indentLine(indentLevel, renderElseHeader(lang)));
    parts.push(
      node.elseBody.length > 0
        ? node.elseBody.map((stmt) => renderStatement(stmt, lang, indentLevel + 1)).join("\n")
        : indentLine(indentLevel + 1, "# empty"),
    );
  }

  if (lang.syntax.blockStyle === "then_end") {
    parts.push(indentLine(indentLevel, lang.symbols.blockCloseToken ?? "end"));
  }

  return parts.join("\n");
}

function renderWhile(node: WhileNode, lang: GeneratedPlanetLanguage, indentLevel: number): string {
  const expr = renderExpr(node.test, lang);

  const header =
    lang.syntax.conditionalStyle === "keyword_paren_expr_block"
      ? `${kw(lang, "while")} (${expr}) ${blockOpen(lang)}`
      : `${kw(lang, "while")} ${expr} ${blockOpen(lang)}`;

  const body =
    node.body.length > 0
      ? node.body.map((stmt) => renderStatement(stmt, lang, indentLevel + 1)).join("\n")
      : indentLine(indentLevel + 1, "# empty");

  if (lang.syntax.blockStyle === "then_end") {
    return `${indentLine(indentLevel, header)}\n${body}\n${indentLine(indentLevel, lang.symbols.blockCloseToken ?? "end")}`;
  }

  return `${indentLine(indentLevel, header)}\n${body}`;
}

function renderForHeader(node: ForNode, lang: GeneratedPlanetLanguage): string {
  const iter = renderExpr(node.iterable, lang);

  switch (lang.syntax.forStyle) {
    case "for_var_in_iter":
      return `${kw(lang, "for")} ${node.variable} ${kw(lang, "in")} ${iter} ${blockOpen(lang)}`;
    case "for_paren_var_in_iter":
      return `${kw(lang, "for")} (${node.variable} ${kw(lang, "in")} ${iter}) ${blockOpen(lang)}`;
    case "for_iter_as_var":
      return `${kw(lang, "for")} ${iter} as ${node.variable} ${blockOpen(lang)}`;
    default:
      return `${kw(lang, "for")} ${node.variable} ${kw(lang, "in")} ${iter} ${blockOpen(lang)}`;
  }
}

function renderFor(node: ForNode, lang: GeneratedPlanetLanguage, indentLevel: number): string {
  const header = indentLine(indentLevel, renderForHeader(node, lang));
  const body =
    node.body.length > 0
      ? node.body.map((stmt) => renderStatement(stmt, lang, indentLevel + 1)).join("\n")
      : indentLine(indentLevel + 1, "# empty");

  if (lang.syntax.blockStyle === "then_end") {
    return `${header}\n${body}\n${indentLine(indentLevel, lang.symbols.blockCloseToken ?? "end")}`;
  }

  return `${header}\n${body}`;
}

function renderStringLiteral(node: StringLiteralNode): string {
  return JSON.stringify(node.value);
}

function renderListLiteral(node: ListLiteralNode, lang: GeneratedPlanetLanguage): string {
  return `[${node.elements.map((el) => renderExpr(el, lang)).join(", ")}]`;
}

function renderIndexExpr(node: IndexExprNode, lang: GeneratedPlanetLanguage): string {
  return `${renderExpr(node.target, lang)}[${renderExpr(node.index, lang)}]`;
}

export function renderStatement(
  node: StatementNode,
  lang: GeneratedPlanetLanguage,
  indentLevel = 0,
): string {
  switch (node.type) {
    case "FunctionDef":
      return renderFunctionDef(node, lang, indentLevel);
    case "Assign":
      return renderAssign(node, lang, indentLevel);
    case "If":
      return renderIf(node, lang, indentLevel);
    case "While":
      return renderWhile(node, lang, indentLevel);
    case "For":
      return renderFor(node, lang, indentLevel);
    case "Return":
      return renderReturn(node, lang, indentLevel);
    case "Break":
      return renderBreak(node, lang, indentLevel);
    case "Continue":
      return renderContinue(node, lang, indentLevel);
    case "ExprStatement":
      return renderExprStatement(node, lang, indentLevel);
    default: {
      const _exhaustive: never = node;
      throw new Error(`Unhandled statement node: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

export function renderAlien(
  program: ProgramNode,
  lang: GeneratedPlanetLanguage,
): string {
  return program.body.map((stmt) => renderStatement(stmt, lang, 0)).join("\n");
}