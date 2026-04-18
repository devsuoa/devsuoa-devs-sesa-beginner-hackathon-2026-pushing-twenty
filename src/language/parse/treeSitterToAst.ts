import type {
  AssignNode,
  BinaryExprNode,
  BinaryOperator,
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
  IndexExprNode,
  ListLiteralNode,
  NoneLiteralNode,
  NumberLiteralNode,
  ProgramNode,
  ReturnNode,
  StatementNode,
  StringLiteralNode,
  UnaryExprNode,
  UnaryOperator,
  WhileNode,
} from "../types";

type TSNode = {
  type: string;
  text: string;
  namedChildCount: number;
  children: TSNode[];
  namedChildren: TSNode[];
  childForFieldName(name: string): TSNode | null;
};

function getNamedChildren(node: TSNode): TSNode[] {
  return node.namedChildren ?? [];
}

function getSingleNamedChild(node: TSNode, message?: string): TSNode {
  const children = getNamedChildren(node);
  if (children.length !== 1) {
    fail(node, message ?? "Expected exactly one named child");
  }
  return children[0];
}

function getBinarySides(node: TSNode): { left: TSNode; right: TSNode } {
  if (node.type === "comparison_operator") {
    const children = getNamedChildren(node);
    if (children.length !== 2) {
      fail(node, "comparison_operator must have exactly 2 named children");
    }
    return {
      left: children[0],
      right: children[1],
    };
  }

  const left = node.childForFieldName("left");
  const right = node.childForFieldName("right");

  if (!left || !right) {
    const children = getNamedChildren(node);
    if (children.length === 2) {
      return {
        left: children[0],
        right: children[1],
      };
    }
    fail(node, "Could not determine binary expression sides");
  }

  return { left, right };
}

function fail(node: TSNode, message: string): never {
  throw new Error(`${message}. Node type: ${node.type}. Text: ${node.text}`);
}

function getRequiredField(node: TSNode, fieldName: string): TSNode {
  const child = node.childForFieldName(fieldName);
  if (!child) {
    throw new Error(`Missing field "${fieldName}" on node type "${node.type}"`);
  }
  return child;
}

function parseIdentifier(node: TSNode): IdentifierNode {
  if (node.type !== "identifier") {
    fail(node, "Expected identifier");
  }

  return {
    type: "Identifier",
    name: node.text,
  };
}

function parseNumber(node: TSNode): NumberLiteralNode {
  if (node.type !== "integer") {
    fail(node, "Expected integer");
  }

  return {
    type: "NumberLiteral",
    value: Number(node.text),
  };
}

function parseBoolean(node: TSNode): BooleanLiteralNode {
  if (node.type !== "true" && node.type !== "false") {
    fail(node, "Expected boolean literal");
  }

  return {
    type: "BooleanLiteral",
    value: node.type === "true",
  };
}

function parseNone(node: TSNode): NoneLiteralNode {
  if (node.type !== "none") {
    fail(node, "Expected None literal");
  }

  return { type: "NoneLiteral" };
}

function unwrapParenthesized(node: TSNode): TSNode {
  if (node.type === "parenthesized_expression" && node.namedChildren.length === 1) {
    return unwrapParenthesized(node.namedChildren[0]);
  }
  return node;
}

function parseCall(node: TSNode): CallExprNode {
  if (node.type !== "call") {
    fail(node, "Expected call");
  }

  const functionNode = getRequiredField(node, "function");
  const argsNode = getRequiredField(node, "arguments");

  if (functionNode.type !== "identifier") {
    fail(functionNode, "Only simple function calls are supported");
  }

  const args = argsNode.namedChildren.map(parseExpr);

  return {
    type: "CallExpr",
    callee: functionNode.text,
    args,
  };
}

function parseUnary(node: TSNode): UnaryExprNode {
  if (node.type !== "unary_operator") {
    fail(node, "Expected unary operator");
  }

  const operandNode = getRequiredField(node, "argument");
  const operatorText = node.text.slice(0, node.text.length - operandNode.text.length).trim();

  let operator: UnaryOperator;
  if (operatorText === "-") {
    operator = "-";
  } else if (operatorText === "not") {
    operator = "not";
  } else {
    fail(node, `Unsupported unary operator "${operatorText}"`);
  }

  return {
    type: "UnaryExpr",
    operator,
    operand: parseExpr(operandNode),
  };
}

function parseBinary(node: TSNode): BinaryExprNode {
  if (
    node.type !== "binary_operator" &&
    node.type !== "comparison_operator" &&
    node.type !== "boolean_operator"
  ) {
    fail(node, "Expected binary expression");
  }

  const { left: leftNode, right: rightNode } = getBinarySides(node);

  let operatorText = "";
  const leftText = leftNode.text;
  const rightText = rightNode.text;

  const start = node.text.indexOf(leftText) + leftText.length;
  const end = node.text.lastIndexOf(rightText);

  if (start >= 0 && end >= start) {
    operatorText = node.text.slice(start, end).trim();
  }

  const allowedOps: BinaryOperator[] = [
    "+",
    "-",
    "*",
    "/",
    "%",
    "==",
    "!=",
    "<",
    "<=",
    ">",
    ">=",
    "and",
    "or",
  ];

  if (!allowedOps.includes(operatorText as BinaryOperator)) {
    fail(node, `Unsupported binary operator "${operatorText}"`);
  }

  return {
    type: "BinaryExpr",
    operator: operatorText as BinaryOperator,
    left: parseExpr(leftNode),
    right: parseExpr(rightNode),
  };
}

export function parseExpr(node: TSNode): ExprNode {
  const unwrapped = unwrapParenthesized(node);

  if (unwrapped.type === "assignment") {
    fail(unwrapped, "Assignment cannot appear as expression");
  }

  switch (unwrapped.type) {
    case "identifier":
      return parseIdentifier(unwrapped);

    case "integer":
      return parseNumber(unwrapped);

    case "true":
    case "false":
      return parseBoolean(unwrapped);

    case "none":
      return parseNone(unwrapped);

    case "string":
      return parseString(unwrapped);

    case "list":
      return parseList(unwrapped);

    case "subscript":
      return parseSubscript(unwrapped);

    case "call":
      return parseCall(unwrapped);

    case "unary_operator":
      return parseUnary(unwrapped);

    case "binary_operator":
    case "comparison_operator":
    case "boolean_operator":
      return parseBinary(unwrapped);

    default:
      fail(unwrapped, "Unsupported expression");
  }
}

function parseExpressionStatement(node: TSNode): ExprStatementNode {
  const exprNode =
    node.childForFieldName("expression") ??
    getSingleNamedChild(node, "Expected expression statement child");

  if (exprNode.type === "assignment") {
    fail(exprNode, "Assignment should be handled as a statement, not an expression statement");
  }

  return {
    type: "ExprStatement",
    expression: parseExpr(exprNode),
  };
}

function parseAugmentedAssignment(node: TSNode): AssignNode {
  if (node.type !== "augmented_assignment") {
    fail(node, "Expected augmented assignment");
  }

  const leftNode = getRequiredField(node, "left");
  const rightNode = getRequiredField(node, "right");

  if (leftNode.type !== "identifier") {
    fail(leftNode, "Only simple variable augmented assignment is supported");
  }

  const leftText = leftNode.text;
  const rightText = rightNode.text;

  const start = node.text.indexOf(leftText) + leftText.length;
  const end = node.text.lastIndexOf(rightText);

  if (start < 0 || end < start) {
    fail(node, "Could not determine augmented assignment operator");
  }

  const operatorText = node.text.slice(start, end).trim();

  const operatorMap: Record<string, BinaryOperator> = {
    "+=": "+",
    "-=": "-",
    "*=": "*",
    "/=": "/",
    "%=": "%",
  };

  const binaryOperator = operatorMap[operatorText];
  if (!binaryOperator) {
    fail(node, `Unsupported augmented assignment operator "${operatorText}"`);
  }

  return {
    type: "Assign",
    target: leftText,
    value: {
      type: "BinaryExpr",
      operator: binaryOperator,
      left: {
        type: "Identifier",
        name: leftText,
      },
      right: parseExpr(rightNode),
    },
  };
}

function parseAssignment(node: TSNode): AssignNode {
  if (node.type !== "assignment") {
    fail(node, "Expected assignment");
  }

  const leftNode = getRequiredField(node, "left");
  const rightNode = getRequiredField(node, "right");

  if (leftNode.type !== "identifier") {
    fail(leftNode, "Only simple variable assignment is supported");
  }

  return {
    type: "Assign",
    target: leftNode.text,
    value: parseExpr(rightNode), // ✅ list goes here
  };
}

function parseReturn(node: TSNode): ReturnNode {
  if (node.type !== "return_statement") {
    fail(node, "Expected return statement");
  }

  const children = getNamedChildren(node);
  const arg = children[0];

  if (!arg) {
    return {
      type: "Return",
      value: { type: "NoneLiteral" },
    };
  }

  return {
    type: "Return",
    value: parseExpr(arg),
  };
}

function parseBreak(node: TSNode): BreakNode {
  if (node.type !== "break_statement") {
    fail(node, "Expected break statement");
  }

  return { type: "Break" };
}

function parseContinue(node: TSNode): ContinueNode {
  if (node.type !== "continue_statement") {
    fail(node, "Expected continue statement");
  }

  return { type: "Continue" };
}

function parseBlockNode(node: TSNode): StatementNode[] {
  if (node.type !== "block") {
    fail(node, "Expected block");
  }

  return getNamedChildren(node).map(parseStatement);
}

function parseFunctionDef(node: TSNode): FunctionDefNode {
  if (node.type !== "function_definition") {
    fail(node, "Expected function definition");
  }

  const nameNode = getRequiredField(node, "name");
  const paramsNode = getRequiredField(node, "parameters");
  const bodyNode = getRequiredField(node, "body");

  const params = getNamedChildren(paramsNode)
    .filter((child) => child.type === "identifier")
    .map((child) => child.text);

  return {
    type: "FunctionDef",
    name: nameNode.text,
    params,
    body: parseBlockNode(bodyNode),
  };
}

function parseIf(node: TSNode): IfNode {
  if (node.type !== "if_statement") {
    fail(node, "Expected if statement");
  }

  const conditionNode = getRequiredField(node, "condition");
  const consequenceNode = getRequiredField(node, "consequence");

  const elifs: IfNode["elifs"] = [];
  let elseBody: StatementNode[] | null = null;

  for (const child of getNamedChildren(node)) {
    if (child.type === "elif_clause") {
      const elifCondition =
        child.childForFieldName("condition") ?? getNamedChildren(child)[0];
      const elifConsequence =
        child.childForFieldName("consequence") ??
        child.childForFieldName("body") ??
        getNamedChildren(child).find((c) => c.type === "block");

      if (!elifCondition || !elifConsequence) {
        fail(child, "Invalid elif clause");
      }

      elifs.push({
        test: parseExpr(elifCondition),
        body: parseBlockNode(elifConsequence),
      });
    }

    if (child.type === "else_clause") {
      const elseConsequence =
        child.childForFieldName("body") ??
        child.childForFieldName("consequence") ??
        getNamedChildren(child).find((c) => c.type === "block");

      if (!elseConsequence) {
        fail(child, "Invalid else clause");
      }

      elseBody = parseBlockNode(elseConsequence);
    }
  }

  return {
    type: "If",
    test: parseExpr(conditionNode),
    body: parseBlockNode(consequenceNode),
    elifs,
    elseBody,
  };
}

function parseWhile(node: TSNode): WhileNode {
  if (node.type !== "while_statement") {
    fail(node, "Expected while statement");
  }

  const conditionNode = getRequiredField(node, "condition");
  const bodyNode = getRequiredField(node, "body");

  return {
    type: "While",
    test: parseExpr(conditionNode),
    body: parseBlockNode(bodyNode),
  };
}

function parseFor(node: TSNode): ForNode {
  if (node.type !== "for_statement") {
    fail(node, "Expected for statement");
  }

  const leftNode = getRequiredField(node, "left");
  const rightNode = getRequiredField(node, "right");
  const bodyNode = getRequiredField(node, "body");

  if (leftNode.type !== "identifier") {
    fail(leftNode, "Only simple for-loop variables are supported");
  }

  return {
    type: "For",
    variable: leftNode.text,
    iterable: parseExpr(rightNode),
    body: parseBlockNode(bodyNode),
  };
}

function parseString(node: TSNode): StringLiteralNode {
  if (node.type !== "string") {
    fail(node, "Expected string");
  }

  return {
    type: "StringLiteral",
    value: JSON.parse(node.text),
  };
}

function parseList(node: TSNode): ListLiteralNode {
  if (node.type !== "list") {
    fail(node, "Expected list");
  }

  return {
    type: "ListLiteral",
    elements: getNamedChildren(node).map(parseExpr),
  };
}

function parseSubscript(node: TSNode): IndexExprNode {
  if (node.type !== "subscript") {
    fail(node, "Expected subscript");
  }

  const targetNode =
    node.childForFieldName("value") ??
    getNamedChildren(node)[0];

  const indexNode =
    node.childForFieldName("subscript") ??
    getNamedChildren(node)[1];

  if (!targetNode || !indexNode) {
    fail(node, "Invalid subscript");
  }

  return {
    type: "IndexExpr",
    target: parseExpr(targetNode),
    index: parseExpr(indexNode),
  };
}

export function parseStatement(node: TSNode): StatementNode {

  switch (node.type) {
    case "function_definition":
      return parseFunctionDef(node);

    case "augmented_assignment":
      return parseAugmentedAssignment(node);

    case "assignment":
      return parseAssignment(node);

    case "if_statement":
      return parseIf(node);

    case "while_statement":
      return parseWhile(node);

    case "for_statement":
      return parseFor(node);

    case "return_statement":
      return parseReturn(node);

    case "break_statement":
      return parseBreak(node);

    case "continue_statement":
      return parseContinue(node);

    case "expression_statement": {
      const child =
        node.childForFieldName("expression") ??
        getSingleNamedChild(node, "Expected expression statement child");

      if (child.type === "assignment") {
        return parseAssignment(child);
      }

      if (child.type === "augmented_assignment") {
        return parseAugmentedAssignment(child);
      }

      return {
        type: "ExprStatement",
        expression: parseExpr(child),
      };
    }

    default:
      fail(node, "Unsupported statement");
  }
}

export function treeSitterToAst(rootNode: TSNode): ProgramNode {
  const moduleNode = rootNode.type === "module" ? rootNode : rootNode.namedChildren[0];

  if (!moduleNode || moduleNode.type !== "module") {
    fail(rootNode, "Expected module root");
  }

  return {
    type: "Program",
    body: moduleNode.namedChildren.map(parseStatement),
  };
}