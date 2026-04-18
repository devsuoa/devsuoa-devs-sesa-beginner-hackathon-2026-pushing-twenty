import type {
  LanguageFamily,
  OperatorMap,
  SemanticRoots,
} from "../types";
import type { ResolvedMorphology } from "../types";
import { finishToken, joinParts } from "./tokenUtils";

function ensureDistinctOperators(operators: OperatorMap): void {
  const values = Object.values(operators);
  const unique = new Set(values);

  if (unique.size !== values.length) {
    throw new Error("Duplicate generated operator tokens");
  }
}

export function generateOperators(
  family: LanguageFamily,
  roots: SemanticRoots,
  morphology: ResolvedMorphology,
): OperatorMap {
  const raw: OperatorMap = {
    "+": joinParts(morphology.arithmeticPrefix, roots.join, "a", morphology.arithmeticSuffix),
    "-": joinParts(morphology.arithmeticPrefix, roots.negation, "s", morphology.arithmeticSuffix),
    "*": joinParts(morphology.arithmeticPrefix, roots.loop, "m", morphology.arithmeticSuffix),
    "/": joinParts(morphology.arithmeticPrefix, roots.choice, "d", morphology.arithmeticSuffix),
    "%": joinParts(morphology.arithmeticPrefix, roots.membership, "mo", morphology.arithmeticSuffix),

    "==": joinParts(morphology.comparisonPrefix, roots.truth, morphology.comparisonSuffix),
    "!=": joinParts(morphology.comparisonPrefix, morphology.negationPrefix, roots.truth, morphology.comparisonSuffix),
    "<": joinParts(morphology.comparisonPrefix, roots.branch, "lt", morphology.comparisonSuffix),
    "<=": joinParts(morphology.comparisonPrefix, roots.branch, "le", morphology.comparisonSuffix),
    ">": joinParts(morphology.comparisonPrefix, roots.alternate, "gt", morphology.comparisonSuffix),
    ">=": joinParts(morphology.comparisonPrefix, roots.alternate, "ge", morphology.comparisonSuffix),

    and: joinParts(morphology.logicPrefix, roots.join, morphology.logicSuffix),
    or: joinParts(morphology.logicPrefix, roots.choice, morphology.logicSuffix),
    not: joinParts(morphology.logicPrefix, morphology.negationPrefix, roots.negation, morphology.logicSuffix),
  };

  return {
    "+": finishToken(raw["+"], family),
    "-": finishToken(raw["-"], family),
    "*": finishToken(raw["*"], family),
    "/": finishToken(raw["/"], family),
    "%": finishToken(raw["%"], family),
    "==": finishToken(raw["=="], family),
    "!=": finishToken(raw["!="], family),
    "<": finishToken(raw["<"], family),
    "<=": finishToken(raw["<="], family),
    ">": finishToken(raw[">"], family),
    ">=": finishToken(raw[">="], family),
    and: finishToken(raw.and, family),
    or: finishToken(raw.or, family),
    not: finishToken(raw.not, family),
  };
}