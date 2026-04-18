import type { ProgramNode } from "../types";

export const simpleAssignmentProgram: ProgramNode = {
  type: "Program",
  body: [
    {
      type: "Assign",
      target: "x",
      value: {
        type: "NumberLiteral",
        value: 3,
      },
    },
    {
      type: "Return",
      value: {
        type: "Identifier",
        name: "x",
      },
    },
  ],
};

export const max2Program: ProgramNode = {
  type: "Program",
  body: [
    {
      type: "FunctionDef",
      name: "max2",
      params: ["a", "b"],
      body: [
        {
          type: "If",
          test: {
            type: "BinaryExpr",
            operator: ">",
            left: {
              type: "Identifier",
              name: "a",
            },
            right: {
              type: "Identifier",
              name: "b",
            },
          },
          body: [
            {
              type: "Return",
              value: {
                type: "Identifier",
                name: "a",
              },
            },
          ],
          elifs: [],
          elseBody: [
            {
              type: "Return",
              value: {
                type: "Identifier",
                name: "b",
              },
            },
          ],
        },
      ],
    },
  ],
};

export const loopProgram: ProgramNode = {
  type: "Program",
  body: [
    {
      type: "FunctionDef",
      name: "countdown",
      params: ["n"],
      body: [
        {
          type: "While",
          test: {
            type: "BinaryExpr",
            operator: ">",
            left: {
              type: "Identifier",
              name: "n",
            },
            right: {
              type: "NumberLiteral",
              value: 0,
            },
          },
          body: [
            {
              type: "ExprStatement",
              expression: {
                type: "CallExpr",
                callee: "print",
                args: [
                  {
                    type: "Identifier",
                    name: "n",
                  },
                ],
              },
            },
            {
              type: "Assign",
              target: "n",
              value: {
                type: "BinaryExpr",
                operator: "-",
                left: {
                  type: "Identifier",
                  name: "n",
                },
                right: {
                  type: "NumberLiteral",
                  value: 1,
                },
              },
            },
          ],
        },
        {
          type: "Return",
          value: {
            type: "NoneLiteral",
          },
        },
      ],
    },
  ],
};

export const forLoopProgram: ProgramNode = {
  type: "Program",
  body: [
    {
      type: "FunctionDef",
      name: "echo_all",
      params: ["items"],
      body: [
        {
          type: "For",
          variable: "item",
          iterable: {
            type: "Identifier",
            name: "items",
          },
          body: [
            {
              type: "ExprStatement",
              expression: {
                type: "CallExpr",
                callee: "print",
                args: [
                  {
                    type: "Identifier",
                    name: "item",
                  },
                ],
              },
            },
          ],
        },
        {
          type: "Return",
          value: {
            type: "NoneLiteral",
          },
        },
      ],
    },
  ],
};