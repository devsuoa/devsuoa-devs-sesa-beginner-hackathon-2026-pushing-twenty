import type { LanguageFamily } from "../types";
import type { Rng } from "./generateSemanticRoots";

export interface ResolvedMorphology {
  actionSuffix: string;
  conditionSuffix: string;
  literalSuffix: string;
  alternatePrefix: string;
  iteratorSuffix: string;
  negationPrefix: string;
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
    actionSuffix: normalizePiece(
      randomChoice(morphology.actionSuffixes, rng, ""),
    ),
    conditionSuffix: normalizePiece(
      randomChoice(morphology.conditionSuffixes, rng, ""),
    ),
    literalSuffix: normalizePiece(
      randomChoice(morphology.literalSuffixes, rng, ""),
    ),
    alternatePrefix: normalizePiece(
      randomChoice(morphology.alternatePrefixes, rng, ""),
    ),
    iteratorSuffix: normalizePiece(
      randomChoice(morphology.iteratorSuffixes, rng, ""),
    ),
    negationPrefix: normalizePiece(
      randomChoice(morphology.negationPrefixes, rng, ""),
    ),
  };
}