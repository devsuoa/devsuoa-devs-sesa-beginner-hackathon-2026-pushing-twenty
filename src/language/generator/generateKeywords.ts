import type {
  KeywordMap,
  LanguageFamily,
  ResolvedMorphology,
  SemanticRoots,
} from "../types";

function applyCaseStyle(word: string, family: LanguageFamily): string {
  const style = family.visualStyle.defaultCaseStyle;

  if (style === "upper") {
    return word.toUpperCase();
  }

  if (style === "title") {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return word.toLowerCase();
}

function cleanKeyword(word: string): string {
  return word
    .replace(/(.)\1\1+/g, "$1$1")
    .replace(/[^a-zA-Z~!?#^_-]/g, "")
    .trim();
}

function squashBoundary(left: string, right: string): string {
  if (!left) return right;
  if (!right) return left;

  const leftLast = left[left.length - 1];
  const rightFirst = right[0];

  if (leftLast.toLowerCase() === rightFirst.toLowerCase()) {
    return left + right.slice(1);
  }

  return left + right;
}

function joinParts(...parts: string[]): string {
  return parts.filter(Boolean).reduce((acc, part) => squashBoundary(acc, part), "");
}

function finishKeyword(word: string, family: LanguageFamily): string {
  return applyCaseStyle(cleanKeyword(word), family);
}

function ensureDistinctKeywords(keywords: KeywordMap): void {
  const seen = new Map<string, string>();

  for (const [canonical, alien] of Object.entries(keywords)) {
    const existing = seen.get(alien);
    if (existing) {
      throw new Error(
        `Duplicate generated keyword "${alien}" for "${existing}" and "${canonical}"`,
      );
    }
    seen.set(alien, canonical);
  }
}

export function generateKeywords(
  family: LanguageFamily,
  roots: SemanticRoots,
  morphology: ResolvedMorphology,
): KeywordMap {
  const rawKeywords: KeywordMap = {
    def: joinParts(roots.create, morphology.actionSuffix),
    return: joinParts(roots.send, morphology.actionSuffix),

    if: joinParts(roots.branch, morphology.conditionSuffix),

    elif: morphology.alternatePrefix
      ? joinParts(morphology.alternatePrefix, roots.branch)
      : joinParts(roots.branch, roots.alternate),

    else: morphology.alternatePrefix
      ? joinParts(morphology.alternatePrefix, roots.alternate)
      : roots.alternate,

    for: joinParts(roots.loop, morphology.iteratorSuffix),

    while: joinParts(roots.loop, morphology.actionSuffix),

    in: roots.membership,

    break: joinParts(roots.terminate, morphology.actionSuffix),

    continue: joinParts(
      roots.loop,
      morphology.iteratorSuffix,
      morphology.actionSuffix,
    ),

    True: joinParts(roots.truth, morphology.literalSuffix),

    False: joinParts(roots.falsehood, morphology.literalSuffix),

    None: joinParts(roots.nullity, morphology.literalSuffix),

    and: roots.join,
    or: roots.choice,

    not: morphology.negationPrefix
      ? joinParts(morphology.negationPrefix, roots.negation)
      : roots.negation,
  };

  const keywords: KeywordMap = {
    def: finishKeyword(rawKeywords.def, family),
    return: finishKeyword(rawKeywords.return, family),
    if: finishKeyword(rawKeywords.if, family),
    elif: finishKeyword(rawKeywords.elif, family),
    else: finishKeyword(rawKeywords.else, family),
    for: finishKeyword(rawKeywords.for, family),
    while: finishKeyword(rawKeywords.while, family),
    in: finishKeyword(rawKeywords.in, family),
    break: finishKeyword(rawKeywords.break, family),
    continue: finishKeyword(rawKeywords.continue, family),
    True: finishKeyword(rawKeywords.True, family),
    False: finishKeyword(rawKeywords.False, family),
    None: finishKeyword(rawKeywords.None, family),
    and: finishKeyword(rawKeywords.and, family),
    or: finishKeyword(rawKeywords.or, family),
    not: finishKeyword(rawKeywords.not, family),
  };

  ensureDistinctKeywords(keywords);

  return keywords;
}