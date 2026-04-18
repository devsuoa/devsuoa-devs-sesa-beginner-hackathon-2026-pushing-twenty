import type { LanguageFamily } from "../types";

export const sharpFamily: LanguageFamily = {
  id: "sharp",
  displayName: "Sharp",
  description:
    "A clipped, angular language family with short sci-fi sounding keywords and concise syntax.",

  phonology: {
    consonants: ["k", "z", "t", "r", "v", "ch", "n", "x"],
    vowels: ["a", "o", "i", "u"],
    syllablePatterns: ["CV", "CVC", "CVCC"],
    minSyllables: 1,
    maxSyllables: 2,
  },

  morphology: {
    actionSuffixes: ["a", "ar", "i"],
    conditionSuffixes: ["or", "ek"],
    literalSuffixes: ["ul", "um"],
    alternatePrefixes: ["va", "zu"],
    iteratorSuffixes: ["in", "ir"],
    negationPrefixes: ["ch", "n"],
  },

  syntaxBias: {
    assignmentStyles: ["equals", "arrow"],
    functionStyles: [
      "keyword_name_params_block",
      "keyword_name_square_params_block",
    ],
    blockStyles: ["indent", "arrow_indent"],
    conditionalStyles: ["keyword_expr_block", "keyword_paren_expr_block"],
    elseStyles: ["keyword_block", "keyword_spaced_block"],
    forStyles: ["for_var_in_iter", "for_paren_var_in_iter"],
  },

  visualStyle: {
    defaultCaseStyle: "lower",
    uppercaseChance: 0.05,
    prefersSymbols: false,
  },
};