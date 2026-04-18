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
    negationPrefixes: ["sh", "n"],

    arithmeticPrefixes: ["ka", "ta"],
    arithmeticSuffixes: ["ix", "ak"],

    comparisonPrefixes: ["ve", "zo"],
    comparisonSuffixes: ["et", "or"],

    logicPrefixes: ["shi", "ra"],
    logicSuffixes: ["en", "ik"],

    builtinPrefixes: ["ul", "tor"],
    builtinSuffixes: ["a", "um"],

    assignmentRoots: ["bind", "lock", "vak", "tash"],
    assignmentPrefixes: ["", "z", "k"],
    assignmentSuffixes: ["", "ar", "ik"],
  },

  syntaxBias: {
    assignmentStyles: ["word_infix", "word_suffix"],
    functionStyles: ["keyword_name_params_block"],
    blockStyles: ["indent"],
    conditionalStyles: ["keyword_expr_block"],
    elseStyles: ["keyword_block"],
    forStyles: ["for_var_in_iter"],
  },

  visualStyle: {
    defaultCaseStyle: "lower",
    uppercaseChance: 0.05,
    prefersSymbols: false,
  },
};