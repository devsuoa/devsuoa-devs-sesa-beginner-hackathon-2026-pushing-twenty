import type { ProgramNode } from "../types";
import { getPythonParser } from "./treeSitter";
import { treeSitterToAst } from "./treeSitterToAst";

export async function parsePythonWithTreeSitter(
  source: string,
): Promise<ProgramNode> {
  const parser = await getPythonParser();
  const tree = parser.parse(source);

  if (!tree) {
    throw new Error("Tree-sitter failed to parse source");
  }
  return treeSitterToAst(tree.rootNode as never);
}