import { generatePlanetLanguage } from "../language/generator/generatePlanetLanguage";

function logPlanet(seed: number): void {
  try {
    const lang = generatePlanetLanguage(seed);

    console.log("=".repeat(60));
    console.log(`Planet seed: ${seed}`);
    console.log(`Family: ${lang.familyId}`);
    console.log("");

    console.log("Morphology:");
    console.table(lang.morphology);

    console.log("Roots:");
    console.table(lang.roots);

    console.log("Keywords:");
    console.table(lang.keywords);

    console.log("Syntax:");
    console.table(lang.syntax);

    console.log("Symbols:");
    console.table(lang.symbols);

    console.log("Cosmetic:");
    console.table(lang.cosmetic);

    const keywordValues = Object.values(lang.keywords);
    const duplicates = keywordValues.filter(
      (value, index) => keywordValues.indexOf(value) !== index,
    );

    if (duplicates.length > 0) {
      console.warn("Duplicate keywords found:", duplicates);
    } else {
      console.log("No duplicate keywords found.");
    }
  } catch (error) {
    console.error(`Failed to generate language for seed ${seed}:`, error);
  }
}

function logSeedRange(start: number, count: number): void {
  for (let i = 0; i < count; i++) {
    logPlanet(start + i);
  }
}

// Change these however you want
//logPlanet(1);
logSeedRange(1, 100);