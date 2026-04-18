import type { LanguageFamily } from "../types";
import type { Rng } from "./generateSemanticRoots";

export interface ResolvedMorphology {
  actionSuffix: string;
  conditionSuffix: string;
  literalSuffix: string;
  alternatePrefix: string;
  iteratorSuffix: string;
  negationPrefix: string;

  arithmeticPrefix: string;
  arithmeticSuffix: string;

  comparisonPrefix: string;
  comparisonSuffix: string;

  logicPrefix: string;
  logicSuffix: string;

  builtinPrefix: string;
  builtinSuffix: string;

  assignmentRoot: string;
  assignmentPrefix: string;
  assignmentSuffix: string;
}

function randomChoice<T>(items: T[], rng: Rng, fallback: T): T {
  if (items.length === 0) return fallback;
  return items[Math.floor(rng.next() * items.length)];
}

function normalizePiece(piece: string): string {
  return piece.trim();
}

export function resolveMorphology(
  family: LanguageFamily,
  rng: Rng,
): ResolvedMorphology {
  const { morphology } = family;

    return {
      actionSuffix: normalizePiece(randomChoice(morphology.actionSuffixes, rng, "")),
      conditionSuffix: normalizePiece(randomChoice(morphology.conditionSuffixes, rng, "")),
      literalSuffix: normalizePiece(randomChoice(morphology.literalSuffixes, rng, "")),
      alternatePrefix: normalizePiece(randomChoice(morphology.alternatePrefixes, rng, "")),
      iteratorSuffix: normalizePiece(randomChoice(morphology.iteratorSuffixes, rng, "")),
      negationPrefix: normalizePiece(randomChoice(morphology.negationPrefixes, rng, "")),

      arithmeticPrefix: normalizePiece(randomChoice(morphology.arithmeticPrefixes, rng, "")),
      arithmeticSuffix: normalizePiece(randomChoice(morphology.arithmeticSuffixes, rng, "")),

      comparisonPrefix: normalizePiece(randomChoice(morphology.comparisonPrefixes, rng, "")),
      comparisonSuffix: normalizePiece(randomChoice(morphology.comparisonSuffixes, rng, "")),

      logicPrefix: normalizePiece(randomChoice(morphology.logicPrefixes, rng, "")),
      logicSuffix: normalizePiece(randomChoice(morphology.logicSuffixes, rng, "")),

      builtinPrefix: normalizePiece(randomChoice(morphology.builtinPrefixes, rng, "")),
      builtinSuffix: normalizePiece(randomChoice(morphology.builtinSuffixes, rng, "")),

      assignmentRoot: normalizePiece(randomChoice(morphology.assignmentRoots, rng, "")),
      assignmentPrefix: normalizePiece(randomChoice(morphology.assignmentPrefixes, rng, "")),
      assignmentSuffix: normalizePiece(randomChoice(morphology.assignmentSuffixes, rng, "")),
  };
}