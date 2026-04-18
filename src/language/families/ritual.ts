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
    arithmeticPrefixes: ["tha", "vel"],
    arithmeticSuffixes: ["um", "ar"],

    comparisonPrefixes: ["ora", "eth"],
    comparisonSuffixes: ["um", "en"],

    logicPrefixes: ["vel", "th"],
    logicSuffixes: ["ar", "um"],

    builtinPrefixes: ["ora", "vel"],
    builtinSuffixes: ["en", "um"],

    assignmentRoots: ["invoke", "bind", "inscribe", "summon", "kora"],
    assignmentPrefixes: ["", "vel", "tha"],
    assignmentSuffixes: ["", "um", "en"],
    },
  syntaxBias: {
    assignmentStyles: ["put_in", "word_prefix", "word_infix"],
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