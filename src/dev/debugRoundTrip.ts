import { parsePython } from "../language/parse/parsePython";
import { renderPython } from "../language/render/renderPython";
import { renderAlien } from "../language/render/renderAlien";
import { generatePlanetLanguage } from "../language/generator/generatePlanetLanguage";

const source = `
def add(a, b):
    if a == b:
        return 0
    return a + b
`.trim();

const ast = parsePython(source);
const lang = generatePlanetLanguage(3812);

console.log("AST:", ast);
console.log("RENDERED PYTHON:");
console.log(renderPython(ast));
console.log("RENDERED ALIEN:");
console.log(renderAlien(ast, lang));