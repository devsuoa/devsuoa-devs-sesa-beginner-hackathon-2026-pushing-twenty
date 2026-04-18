import type { LanguageFamily } from "../types";

export function squashBoundary(left: string, right: string): string {
  if (!left) return right;
  if (!right) return left;

  const leftLast = left[left.length - 1];
  const rightFirst = right[0];

  if (leftLast.toLowerCase() === rightFirst.toLowerCase()) {
    return left + right.slice(1);
  }

  return left + right;
}

export function joinParts(...parts: string[]): string {
  return parts.filter(Boolean).reduce((acc, part) => squashBoundary(acc, part), "");
}

export function applyCaseStyle(word: string, family: LanguageFamily): string {
  const style = family.visualStyle.defaultCaseStyle;

  if (style === "upper") return word.toUpperCase();
  if (style === "title") return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  return word.toLowerCase();
}

export function cleanToken(word: string): string {
  return word
    .replace(/(.)\1\1+/g, "$1$1")
    .replace(/[^a-zA-Z~!?#^_\-:]/g, "")
    .trim();
}

export function finishToken(word: string, family: LanguageFamily): string {
  return applyCaseStyle(cleanToken(word), family);
}