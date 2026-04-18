import type {
  BuiltinMap,
  LanguageFamily,
  SemanticRoots,
  ResolvedMorphology
} from "../types";
import { finishToken, joinParts } from "./tokenUtils"

export function generateBuiltins(
  family: LanguageFamily,
  roots: SemanticRoots,
  morphology: ResolvedMorphology,
): BuiltinMap {
  const raw: BuiltinMap = {
    print: joinParts(morphology.builtinPrefix, roots.send, "out", morphology.builtinSuffix),
    len: joinParts(morphology.builtinPrefix, roots.membership, "len", morphology.builtinSuffix),
    range: joinParts(morphology.builtinPrefix, roots.loop, "range", morphology.builtinSuffix),
  };

  const builtins: BuiltinMap = {
    print: finishToken(raw.print, family),
    len: finishToken(raw.len, family),
    range: finishToken(raw.range, family),
  };

  const values = Object.values(builtins);
  if (new Set(values).size !== values.length) {
    throw new Error("Duplicate generated builtin tokens");
  }

  return builtins;
}