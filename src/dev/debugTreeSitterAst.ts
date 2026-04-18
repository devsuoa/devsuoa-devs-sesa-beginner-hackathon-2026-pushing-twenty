import { generatePlanetLanguage } from "../language/generator/generatePlanetLanguage";
import { parsePythonWithTreeSitter } from "../language/parse/parsePythonWithTreeSitter";
import { renderAlien } from "../language/render/renderAlien";
import { parseAlien } from "../language/parse/parseAlien";
import { renderPython } from "../language/render/renderPython";

async function run() {
  const pythonSource = `
def bigger(a, b):
    if a > b and a != 0:
        print(a)
        return len(range(a))
    else:
        return b + 1
  `.trim();

  const lang = generatePlanetLanguage(3812);
  const ast = await parsePythonWithTreeSitter(pythonSource);
  const alien = renderAlien(ast, lang);
  const roundTripAst = parseAlien(alien, lang);
  const pythonAgain = renderPython(roundTripAst);

  console.log("OPERATORS:", lang.operators);
  console.log("BUILTINS:", lang.builtins);
  console.log("ALIEN:\n", alien);
  console.log("PYTHON AGAIN:\n", pythonAgain);
}

run().catch(console.error);