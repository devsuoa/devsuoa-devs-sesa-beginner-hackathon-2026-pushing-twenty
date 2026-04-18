import type { LanguageFamily } from "../types";

export const flowingFamily: LanguageFamily = {
  id: "flowing",
  displayName: "Flowing",
  description: "Soft, melodic language with vowel-heavy, organic structure.",

  phonology: {
    consonants: ["l", "m", "n", "s", "v", "r"],
    vowels: ["a", "e", "i", "o"],
    syllablePatterns: ["CV", "CVV", "CVCV"],
    minSyllables: 2,
    maxSyllables: 3,
  },

  morphology: {
    actionSuffixes: ["ra", "ni", "la"],
    conditionSuffixes: ["sa", "ra"],
    literalSuffixes: ["na", "ra"],
    alternatePrefixes: ["ve", "el"],
    iteratorSuffixes: ["li", "ri"],
    negationPrefixes: ["ne", "no"],
  },

  syntaxBias: {
    assignmentStyles: ["equals", "set_prefix"],
    functionStyles: ["keyword_name_params_block", "make_name_with_params_block"],
    blockStyles: ["indent"],
    conditionalStyles: ["when_expr_then"],
    elseStyles: ["otherwise_then"],
    forStyles: ["for_var_in_iter"],
  },

  visualStyle: {
    defaultCaseStyle: "lower",
    uppercaseChance: 0.0,
    prefersSymbols: false,
  },
};