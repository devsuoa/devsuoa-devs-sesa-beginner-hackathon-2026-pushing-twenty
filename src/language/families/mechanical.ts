import type { LanguageFamily } from "../types";

export const mechanicalFamily: LanguageFamily = {
  id: "mechanical",
  displayName: "Mechanical",
  description: "Rigid, machine-like syntax with command-style keywords.",

  phonology: {
    consonants: ["k", "t", "d", "r", "x"],
    vowels: ["a", "o"],
    syllablePatterns: ["CVC", "CV"],
    minSyllables: 1,
    maxSyllables: 2,
  },

  morphology: {
    actionSuffixes: ["A"],
    conditionSuffixes: ["C"],
    literalSuffixes: ["L"],
    alternatePrefixes: ["ALT"],
    iteratorSuffixes: ["TH"],
    negationPrefixes: ["NEG"],
  },

  syntaxBias: {
    assignmentStyles: ["arrow"],
    functionStyles: ["keyword_name_square_params_block"],
    blockStyles: ["indent", "brace"],
    conditionalStyles: ["keyword_paren_expr_block"],
    elseStyles: ["keyword_block"],
    forStyles: ["for_paren_var_in_iter"],
  },

  visualStyle: {
    defaultCaseStyle: "upper",
    uppercaseChance: 0.9,
    prefersSymbols: false,
  },
};