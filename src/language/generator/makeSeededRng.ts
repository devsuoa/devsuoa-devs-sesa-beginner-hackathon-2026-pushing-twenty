import type { Rng } from "./generateSemanticRoots";

export function makeSeededRng(seed: number): Rng {
  let state = seed >>> 0;

  return {
    next() {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 4294967296;
    },
  };
}