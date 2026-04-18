import type { LanguageFamily } from "../types";

export const ritualFamily: LanguageFamily = {
  id: "ritual",
  displayName: "Ritual",
  description: "Ancient, ceremonial language with mystical phrasing.",

  phonology: {
    consonants: ["m", "n", "th", "r", "l", "v"],
    vowels: ["a", "e", "i", "o", "u"],
    syllablePatterns: ["CV", "CVC", "CVCV"],
    minSyllables: 2,
    maxSyllables: 3,
  },

  morphology: {
    actionSuffixes: ["el", "ar"],
    conditionSuffixes: ["eth", "or"],
    literalSuffixes: ["um", "a"],
    alternatePrefixes: ["otha", "alt"],
    iteratorSuffixes: ["en"],
    negationPrefixes: ["un", "non"],
  },

  syntaxBias: {
    assignmentStyles: ["put_in"],
    functionStyles: ["make_name_with_params_block"],
    blockStyles: ["then_end"],
    conditionalStyles: ["when_expr_then"],
    elseStyles: ["otherwise_then"],
    forStyles: ["for_iter_as_var"],
  },

  visualStyle: {
    defaultCaseStyle: "lower",
    uppercaseChance: 0.1,
    prefersSymbols: false,
  },
};