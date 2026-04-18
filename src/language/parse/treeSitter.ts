import { Parser, Language } from "web-tree-sitter";
import type { Parser as ParserType } from "web-tree-sitter";

let parser: ParserType | null = null;

export async function getPythonParser(): Promise<ParserType> {
  if (parser) return parser;

  await Parser.init({
    locateFile: (url: string) => `/${url}`,
  } as any);

  const python = await Language.load("/tree-sitter-python.wasm");

  parser = new Parser();
  parser.setLanguage(python);

  return parser;
}