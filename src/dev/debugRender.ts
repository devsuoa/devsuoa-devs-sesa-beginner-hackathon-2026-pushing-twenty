import { generatePlanetLanguage } from "../language/generator/generatePlanetLanguage";
import { max2Program } from "../language/examples/examplePrograms";
import { renderAlien } from "../language/render/renderAlien";
import { renderPython } from "../language/render/renderPython";

const lang = generatePlanetLanguage(1001);

console.log("PYTHON:");
console.log(renderPython(max2Program));

console.log("ALIEN:");
console.log(renderAlien(max2Program, lang));