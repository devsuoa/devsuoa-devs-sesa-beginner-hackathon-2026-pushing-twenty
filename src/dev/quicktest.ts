import { getPythonParser } from "../language/parse/treeSitter";

const parser = await getPythonParser();
const tree = parser.parse(`
def max2(a, b):
    if a > b:
        return a
    else:
        return b
`);
console.log(tree?.rootNode.toString());