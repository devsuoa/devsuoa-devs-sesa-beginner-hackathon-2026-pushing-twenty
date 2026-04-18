import { parsePythonWithTreeSitter } from "../language/parse/parsePythonWithTreeSitter";
import { renderAlien } from "../language/render/renderAlien";
import { renderPython } from "../language/render/renderPython";
import { generatePlanetLanguage } from "../language/generator/generatePlanetLanguage";

async function run() {
  const source = `
def max2(a, b):
    if a > b:
        return a
    else:
        return b
`.trim();

  const ast = await parsePythonWithTreeSitter(source);
  const lang = generatePlanetLanguage(1);

  console.log("AST:");
  console.log(ast);

  console.log("PYTHON:");
  console.log(renderPython(ast));

  console.log("ALIEN:");
  console.log(renderAlien(ast, lang));
}

run().catch(console.error);