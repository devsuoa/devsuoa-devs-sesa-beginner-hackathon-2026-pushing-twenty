// src/language/generator/generatePlanetLanguage.ts

import type {
  GeneratedCosmeticConfig,
  GeneratedPlanetLanguage,
  GeneratedSymbolConfig,
  GeneratedSyntaxConfig,
  LanguageFamily,
} from "../types";
import { flowingFamily } from "../families/flowing";
import { mechanicalFamily } from "../families/mechanical";
import { ritualFamily } from "../families/ritual";
import { sharpFamily } from "../families/sharp";
import { generateKeywords } from "./generateKeywords";
import { generateSemanticRoots } from "./generateSemanticRoots";
import { makeSeededRng } from "./makeSeededRng";
import { resolveMorphology } from "./resolveMorphology";

const FAMILIES: LanguageFamily[] = [
  sharpFamily,
  flowingFamily,
  mechanicalFamily,
  ritualFamily,
];

function randomChoice<T>(items: T[], rng: { next(): number }): T {
  return items[Math.floor(rng.next() * items.length)];
}

function chooseFamily(rng: { next(): number }): LanguageFamily {
  const roll = rng.next();

  if (roll < 0.3) return sharpFamily;
  if (roll < 0.55) return flowingFamily;
  if (roll < 0.78) return mechanicalFamily;
  return ritualFamily;
}

function chooseSyntax(family: LanguageFamily, rng: { next(): number }): GeneratedSyntaxConfig {
  return {
    assignmentStyle: randomChoice(family.syntaxBias.assignmentStyles, rng),
    functionStyle: randomChoice(family.syntaxBias.functionStyles, rng),
    blockStyle: randomChoice(family.syntaxBias.blockStyles, rng),
    conditionalStyle: randomChoice(family.syntaxBias.conditionalStyles, rng),
    elseStyle: randomChoice(family.syntaxBias.elseStyles, rng),
    forStyle: randomChoice(family.syntaxBias.forStyles, rng),
  };
}

function deriveSymbols(syntax: GeneratedSyntaxConfig): GeneratedSymbolConfig {
  const assignmentToken =
    syntax.assignmentStyle === "arrow"
      ? "<-"
      : syntax.assignmentStyle === "equals" || syntax.assignmentStyle === "set_prefix"
      ? "="
      : undefined;

  const blockOpenToken =
    syntax.blockStyle === "arrow_indent"
      ? "->"
      : syntax.blockStyle === "indent"
      ? "::"
      : syntax.blockStyle === "brace"
      ? "{"
      : "then";

  const blockCloseToken =
    syntax.blockStyle === "brace"
      ? "}"
      : syntax.blockStyle === "then_end"
      ? "end"
      : undefined;

  const argOpenToken =
    syntax.functionStyle === "keyword_name_square_params_block" ? "[" : "(";

  const argCloseToken =
    syntax.functionStyle === "keyword_name_square_params_block" ? "]" : ")";

  return {
    assignmentToken,
    blockOpenToken,
    blockCloseToken,
    argOpenToken,
    argCloseToken,
  };
}

function deriveCosmetics(family: LanguageFamily): GeneratedCosmeticConfig {
  return {
    caseStyle: family.visualStyle.defaultCaseStyle,
    identifierTransform: "none",
    numeralStyle: "decimal",
  };
}

export function generatePlanetLanguage(
  seed: number,
  planetId: number | string = seed,
): GeneratedPlanetLanguage {
  const rng = makeSeededRng(seed);

  const family = chooseFamily(rng);
  const roots = generateSemanticRoots(family, rng);
  const morphology = resolveMorphology(family, rng);
  const keywords = generateKeywords(family, roots, morphology);
  const syntax = chooseSyntax(family, rng);
  const symbols = deriveSymbols(syntax);
  const cosmetic = deriveCosmetics(family);

  return {
    planetId,
    seed,
    familyId: family.id,
    phonology: family.phonology,
    morphology,
    roots,
    keywords,
    syntax,
    symbols,
    cosmetic,
  };
}