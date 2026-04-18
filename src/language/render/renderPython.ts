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
  IdentifierNode,
  IfNode,
  NoneLiteralNode,
  NumberLiteralNode,
  ProgramNode,
  ReturnNode,
  StatementNode,
  UnaryExprNode,
  WhileNode,
} from "../types";

const INDENT = "    ";

function indentLine(level: number, text: string): string {
  return `${INDENT.repeat(level)}${text}`;
}

function renderIdentifier(node: IdentifierNode): string {
  return node.name;
}

function renderNumberLiteral(node: NumberLiteralNode): string {
  return String(node.value);
}

function renderBooleanLiteral(node: BooleanLiteralNode): string {
  return node.value ? "True" : "False";
}

function renderNoneLiteral(_node: NoneLiteralNode): string {
  return "None";
}

function renderCallExpr(node: CallExprNode): string {
  const args = node.args.map(renderExpr).join(", ");
  return `${node.callee}(${args})`;
}

function renderUnaryExpr(node: UnaryExprNode): string {
  if (node.operator === "not") {
    return `not ${renderExpr(node.operand)}`;
  }
  return `${node.operator}${renderExpr(node.operand)}`;
}

function renderBinaryExpr(node: BinaryExprNode): string {
  return `${renderExpr(node.left)} ${node.operator} ${renderExpr(node.right)}`;
}

export function renderExpr(node: ExprNode): string {
  switch (node.type) {
    case "Identifier":
      return renderIdentifier(node);
    case "NumberLiteral":
      return renderNumberLiteral(node);
    case "BooleanLiteral":
      return renderBooleanLiteral(node);
    case "NoneLiteral":
      return renderNoneLiteral(node);
    case "BinaryExpr":
      return renderBinaryExpr(node);
    case "UnaryExpr":
      return renderUnaryExpr(node);
    case "CallExpr":
      return renderCallExpr(node);
    default: {
      const _exhaustive: never = node;
      throw new Error(`Unhandled expression node: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

function renderAssign(node: AssignNode, indentLevel: number): string {
  return indentLine(indentLevel, `${node.target} = ${renderExpr(node.value)}`);
}

function renderReturn(node: ReturnNode, indentLevel: number): string {
  return indentLine(indentLevel, `return ${renderExpr(node.value)}`);
}

function renderBreak(_node: BreakNode, indentLevel: number): string {
  return indentLine(indentLevel, "break");
}

function renderContinue(_node: ContinueNode, indentLevel: number): string {
  return indentLine(indentLevel, "continue");
}

function renderExprStatement(node: ExprStatementNode, indentLevel: number): string {
  return indentLine(indentLevel, renderExpr(node.expression));
}

function renderFunctionDef(node: FunctionDefNode, indentLevel: number): string {
  const header = indentLine(
    indentLevel,
    `def ${node.name}(${node.params.join(", ")}):`,
  );

  const body =
    node.body.length > 0
      ? node.body.map((stmt) => renderStatement(stmt, indentLevel + 1)).join("\n")
      : indentLine(indentLevel + 1, "pass");

  return `${header}\n${body}`;
}

function renderIf(node: IfNode, indentLevel: number): string {
  const parts: string[] = [];

  parts.push(indentLine(indentLevel, `if ${renderExpr(node.test)}:`));
  parts.push(
    node.body.length > 0
      ? node.body.map((stmt) => renderStatement(stmt, indentLevel + 1)).join("\n")
      : indentLine(indentLevel + 1, "pass"),
  );

  for (const elifBranch of node.elifs) {
    parts.push(indentLine(indentLevel, `elif ${renderExpr(elifBranch.test)}:`));
    parts.push(
      elifBranch.body.length > 0
        ? elifBranch.body
            .map((stmt) => renderStatement(stmt, indentLevel + 1))
            .join("\n")
        : indentLine(indentLevel + 1, "pass"),
    );
  }

  if (node.elseBody) {
    parts.push(indentLine(indentLevel, "else:"));
    parts.push(
      node.elseBody.length > 0
        ? node.elseBody.map((stmt) => renderStatement(stmt, indentLevel + 1)).join("\n")
        : indentLine(indentLevel + 1, "pass"),
    );
  }

  return parts.join("\n");
}

function renderWhile(node: WhileNode, indentLevel: number): string {
  const header = indentLine(indentLevel, `while ${renderExpr(node.test)}:`);
  const body =
    node.body.length > 0
      ? node.body.map((stmt) => renderStatement(stmt, indentLevel + 1)).join("\n")
      : indentLine(indentLevel + 1, "pass");

  return `${header}\n${body}`;
}

function renderFor(node: ForNode, indentLevel: number): string {
  const header = indentLine(
    indentLevel,
    `for ${node.variable} in ${renderExpr(node.iterable)}:`,
  );

  const body =
    node.body.length > 0
      ? node.body.map((stmt) => renderStatement(stmt, indentLevel + 1)).join("\n")
      : indentLine(indentLevel + 1, "pass");

  return `${header}\n${body}`;
}

export function renderStatement(node: StatementNode, indentLevel = 0): string {
  switch (node.type) {
    case "FunctionDef":
      return renderFunctionDef(node, indentLevel);
    case "Assign":
      return renderAssign(node, indentLevel);
    case "If":
      return renderIf(node, indentLevel);
    case "While":
      return renderWhile(node, indentLevel);
    case "For":
      return renderFor(node, indentLevel);
    case "Return":
      return renderReturn(node, indentLevel);
    case "Break":
      return renderBreak(node, indentLevel);
    case "Continue":
      return renderContinue(node, indentLevel);
    case "ExprStatement":
      return renderExprStatement(node, indentLevel);
    default: {
      const _exhaustive: never = node;
      throw new Error(`Unhandled statement node: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

export function renderPython(program: ProgramNode): string {
  return program.body.map((stmt) => renderStatement(stmt, 0)).join("\n\n");
}