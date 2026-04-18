import type {
  LanguageFamily,
  SemanticRootKey,
  SemanticRoots,
  SyllablePattern,
} from "../types";

export interface Rng {
  next(): number; // expected range: [0, 1)
}

const ROOT_KEYS: SemanticRootKey[] = [
  "create",
  "send",
  "branch",
  "alternate",
  "loop",
  "membership",
  "terminate",
  "truth",
  "falsehood",
  "nullity",
  "join",
  "choice",
  "negation",
];

function randomChoice<T>(items: T[], rng: Rng): T {
  return items[Math.floor(rng.next() * items.length)];
}

function randomInt(min: number, max: number, rng: Rng): number {
  return Math.floor(rng.next() * (max - min + 1)) + min;
}

function buildSyllable(
  pattern: SyllablePattern,
  consonants: string[],
  vowels: string[],
  rng: Rng,
): string {
  let out = "";

  for (const ch of pattern) {
    if (ch === "C") {
      out += randomChoice(consonants, rng);
    } else if (ch === "V") {
      out += randomChoice(vowels, rng);
    }
  }

  return out;
}

function normalizeRoot(root: string): string {
  return root
    .replace(/(.)\1\1+/g, "$1$1") // trim extreme repeats
    .replace(/[^a-zA-Z~!?#^_-]/g, "")
    .trim();
}

function generateRootFromPhonology(family: LanguageFamily, rng: Rng): string {
  const { phonology } = family;

  // Symbol-heavy family support
  if (family.visualStyle.prefersSymbols && phonology.consonants.length === 0 && phonology.vowels.length === 0) {
    const symbolicPool = ["?", "!", "~", "^", "#", "@", "%", "&"];
    return randomChoice(symbolicPool, rng);
  }

  const syllableCount = randomInt(
    phonology.minSyllables,
    phonology.maxSyllables,
    rng,
  );

  let root = "";
  for (let i = 0; i < syllableCount; i++) {
    const pattern = randomChoice(phonology.syllablePatterns, rng);
    root += buildSyllable(pattern, phonology.consonants, phonology.vowels, rng);
  }

  return normalizeRoot(root);
}

function applyCaseStyle(root: string, family: LanguageFamily): string {
  const style = family.visualStyle.defaultCaseStyle;

  if (style === "upper") {
    return root.toUpperCase();
  }

  if (style === "title") {
    return root.charAt(0).toUpperCase() + root.slice(1).toLowerCase();
  }

  return root.toLowerCase();
}

function similarityScore(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;

  const minLen = Math.min(a.length, b.length);
  let samePrefix = 0;

  for (let i = 0; i < minLen; i++) {
    if (a[i] === b[i]) samePrefix++;
    else break;
  }

  return samePrefix / minLen;
}

function isTooSimilar(candidate: string, existing: string[]): boolean {
  for (const word of existing) {
    if (candidate === word) return true;

    // avoid near-collisions like "zor" / "zora"
    if (candidate.startsWith(word) || word.startsWith(candidate)) {
      return true;
    }

    if (similarityScore(candidate, word) >= 0.8) {
      return true;
    }
  }

  return false;
}

function generateUniqueRoot(
  family: LanguageFamily,
  rng: Rng,
  used: string[],
  maxAttempts = 50,
): string {
  for (let i = 0; i < maxAttempts; i++) {
    const raw = generateRootFromPhonology(family, rng);
    const cased = applyCaseStyle(raw, family);

    if (cased.length === 0) continue;
    if (!isTooSimilar(cased, used)) {
      used.push(cased);
      return cased;
    }
  }

  throw new Error(`Failed to generate a unique root for family "${family.id}"`);
}

export function generateSemanticRoots(
  family: LanguageFamily,
  rng: Rng,
): SemanticRoots {
  const used: string[] = [];
  const roots = {} as SemanticRoots;

  for (const key of ROOT_KEYS) {
    roots[key] = generateUniqueRoot(family, rng, used);
  }

  return roots;
}