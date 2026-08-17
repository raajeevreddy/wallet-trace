/**
 * Numerology utilities for name and date-of-birth analysis
 * Converts names and dates into numerological values and generates readings
 */

// ─── Numerology Constants ──────────────────────────────────────────────────────

const PYTHAGOREAN_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

// ─── Utility Functions ─────────────────────────────────────────────────────────

export function getLetterValue(letter: string): number {
  return PYTHAGOREAN_VALUES[letter.toUpperCase()] ?? 0;
}

export function reduceToSingleDigit(num: number): number {
  while (num >= 10) {
    num = Math.floor(num / 10) + (num % 10);
  }
  return num;
}

export function getDigitSum(num: number): number {
  let sum = 0;
  while (num > 0) {
    sum += num % 10;
    num = Math.floor(num / 10);
  }
  return sum;
}

export function calculateNameNumber(name: string): { raw: number; reduced: number } {
  let sum = 0;
  for (const char of name.toUpperCase()) {
    sum += getLetterValue(char);
  }
  return { raw: sum, reduced: reduceToSingleDigit(sum) };
}

export function calculateLifePathNumber(dateOfBirth: string): { raw: number; reduced: number } {
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  let sum = 0;

  // Year
  const yearSum = getDigitSum(year);
  sum += yearSum;

  // Month
  const monthSum = getDigitSum(month);
  sum += monthSum;

  // Day
  const daySum = getDigitSum(day);
  sum += daySum;

  return { raw: sum, reduced: reduceToSingleDigit(sum) };
}

export function calculateDestinyNumber(name: string, dob: string): { raw: number; reduced: number } {
  const nameNum = calculateNameNumber(name);
  const lpNum = calculateLifePathNumber(dob);
  const sum = nameNum.raw + lpNum.raw;
  return { raw: sum, reduced: reduceToSingleDigit(sum) };
}

// ─── Number Interpretations ───────────────────────────────────────────────────

const MASTER_NUMBERS = {
  11: "Master Illumination",
  22: "Master Builder",
  33: "Master Compassion",
};

const NUMBER_ARCHETYPES: Record<number, string> = {
  1: "The Leader",
  2: "The Diplomat",
  3: "The Creator",
  4: "The Builder",
  5: "The Wanderer",
  6: "The Healer",
  7: "The Seeker",
  8: "The Materialist",
  9: "The Humanitarian",
};

const NUMBER_KEYWORDS: Record<number, string[]> = {
  1: ["Independence", "Leadership", "Originality", "Ambition"],
  2: ["Cooperation", "Balance", "Sensitivity", "Diplomacy"],
  3: ["Expression", "Creativity", "Communication", "Optimism"],
  4: ["Stability", "Foundation", "Practicality", "Order"],
  5: ["Freedom", "Adventure", "Adaptability", "Change"],
  6: ["Harmony", "Nurturing", "Responsibility", "Care"],
  7: ["Introspection", "Analysis", "Spirituality", "Mystery"],
  8: ["Power", "Success", "Abundance", "Authority"],
  9: ["Compassion", "Completion", "Idealism", "Wisdom"],
};

// ─── Chain Calculation ─────────────────────────────────────────────────────────

export interface NumerologyChain {
  step1_nameNumber: number;
  step2_lifePathNumber: number;
  step3_destinyNumber: number;
  step4_expression: number;
  final_verdict: number;
}

export function calculateChain(name: string, dob: string): NumerologyChain {
  const nameNum = calculateNameNumber(name).reduced;
  const lpNum = calculateLifePathNumber(dob).reduced;
  const destinyNum = calculateDestinyNumber(name, dob).reduced;
  const expression = (nameNum + lpNum) % 9 || 9; // 1-9 range
  const verdict = (destinyNum + expression) % 9 || 9;

  return {
    step1_nameNumber: nameNum,
    step2_lifePathNumber: lpNum,
    step3_destinyNumber: destinyNum,
    step4_expression: expression,
    final_verdict: verdict,
  };
}

// ─── Verdict Generation ────────────────────────────────────────────────────────

export interface NumerologyVerdict {
  archetype: string;
  keywords: string[];
  essence: string;
  strength: string;
  challenge: string;
  guidance: string;
}

export function generateVerdict(number: number): NumerologyVerdict {
  const archetype = (MASTER_NUMBERS as Record<number, string>)[number] || NUMBER_ARCHETYPES[number] || "The Mystery";
  const keywords = NUMBER_KEYWORDS[number] || [];

  const essences: Record<number, string> = {
    1: "Independent pioneer energy — you are meant to lead and create your own path",
    2: "Harmonizing bridge energy — you excel at bringing people together with diplomacy",
    3: "Radiant creative energy — your gift is expression and bringing joy to others",
    4: "Grounded builder energy — you create lasting foundations and stable structures",
    5: "Dynamic change energy — you thrive on freedom, exploration, and new experiences",
    6: "Nurturing healer energy — you are drawn to care for others and create harmony",
    7: "Spiritual seeker energy — you are meant to go deeper and understand mysteries",
    8: "Powerful manifestor energy — you attract abundance and influence others",
    9: "Universal compassion energy — you feel deeply and serve the greater good",
  };

  const strengths: Record<number, string> = {
    1: "Determination, courage, natural leadership",
    2: "Intuition, patience, collaborative skills",
    3: "Charm, versatility, communication gifts",
    4: "Loyalty, reliability, practical problem-solving",
    5: "Curiosity, adaptability, resourcefulness",
    6: "Empathy, artistic sensibility, steadiness",
    7: "Wisdom, analytical mind, spiritual depth",
    8: "Strategic thinking, organizational power, confidence",
    9: "Idealism, emotional intelligence, broad perspective",
  };

  const challenges: Record<number, string> = {
    1: "Impatience, stubbornness, excessive independence",
    2: "Over-sensitivity, indecisiveness, people-pleasing",
    3: "Scattered focus, superficiality, self-doubt",
    4: "Rigidity, lack of flexibility, overwork",
    5: "Restlessness, irresponsibility, impulsiveness",
    6: "Perfectionism, resentment, codependency",
    7: "Isolation, over-analysis, moodiness",
    8: "Materialism, arrogance, workaholism",
    9: "Overwhelm, boundary issues, martyrdom",
  };

  const guidances: Record<number, string> = {
    1: "Channel your pioneering spirit toward meaningful goals that align with your values",
    2: "Trust your intuition and know your worth in relationships and collaborations",
    3: "Share your voice and creativity, but ground your ideas before pursuing them",
    4: "Build something lasting — your patient work creates real, tangible results",
    5: "Embrace change as your teacher, but cultivate self-discipline alongside freedom",
    6: "Love generously but protect your energy — your healing matters too",
    7: "Trust your inner knowing — wisdom comes from solitude and reflection",
    8: "Use your power responsibly — true success includes integrity and legacy",
    9: "Complete your cycles and release what no longer serves the greater good",
  };

  return {
    archetype,
    keywords,
    essence: essences[number] || "A unique vibrational frequency",
    strength: strengths[number] || "Unique gifts and abilities",
    challenge: challenges[number] || "Areas for growth",
    guidance: guidances[number] || "Trust your journey",
  };
}

// ─── Reading Generation ────────────────────────────────────────────────────────

export interface NumerologyReading {
  name: string;
  dateOfBirth: string;
  chain: NumerologyChain;
  verdict: NumerologyVerdict;
  reading: string;
}

export function generateReading(name: string, dob: string): NumerologyReading {
  const chain = calculateChain(name, dob);
  const verdict = generateVerdict(chain.final_verdict);

  const reading = `
${name.toUpperCase()} — Life Path ${chain.step2_lifePathNumber}

${verdict.archetype} carries the essence of ${verdict.keywords[0]}. This is the energy of ${verdict.essence}

Your reading reveals a numerological chain:
• Name Number: ${chain.step1_nameNumber}
• Life Path: ${chain.step2_lifePathNumber}
• Destiny Number: ${chain.step3_destinyNumber}
• Expression: ${chain.step4_expression}
• Final Verdict: ${chain.final_verdict}

Strengths: ${verdict.strength}
Challenges: ${verdict.challenge}

Guidance for growth: ${verdict.guidance}

Your numerological profile suggests you are here to learn ${["independence and courage", "balance and harmony", "creative expression", "building foundations", "embracing change", "giving and nurturing", "seeking wisdom", "manifesting abundance", "serving humanity"][chain.final_verdict - 1]}.
  `.trim();

  return { name, dateOfBirth: dob, chain, verdict, reading };
}

// ─── Name Variant Generation ──────────────────────────────────────────────────

export interface NameVariant {
  name: string;
  type: "full" | "first" | "middle" | "last" | "nickname" | "alternate";
}

export function generateNameVariants(
  fullName: string,
  alternateNames: string
): NameVariant[] {
  const variants: NameVariant[] = [];

  // Add full name
  variants.push({ name: fullName.trim(), type: "full" });

  // Split full name and add parts
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 0) {
    variants.push({ name: parts[0], type: "first" });
  }
  if (parts.length > 1) {
    variants.push({ name: parts[parts.length - 1], type: "last" });
  }
  if (parts.length > 2) {
    for (let i = 1; i < parts.length - 1; i++) {
      variants.push({ name: parts[i], type: "middle" });
    }
  }

  // Add alternate names
  if (alternateNames.trim()) {
    const alternates = alternateNames
      .split(/[,;|]/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    for (const alt of alternates) {
      if (!variants.some((v) => v.name.toLowerCase() === alt.toLowerCase())) {
        variants.push({ name: alt, type: "alternate" });
      }
    }
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return variants.filter((v) => {
    const lower = v.name.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

// ─── Full Profile Analysis ────────────────────────────────────────────────────

export interface NumerologyProfile {
  dateOfBirth: string;
  readings: NumerologyReading[];
  summary: {
    primaryVerdictNumber: number;
    commonKeywords: string[];
    overallEssence: string;
  };
}

export function generateProfile(
  fullName: string,
  dateOfBirth: string,
  alternateNames: string
): NumerologyProfile {
  const variants = generateNameVariants(fullName, alternateNames);
  const readings = variants.map((v) => generateReading(v.name, dateOfBirth));

  // Calculate summary statistics
  const verdictNumbers = readings.map((r) => r.chain.final_verdict);
  const primaryVerdictNumber = Math.round(verdictNumbers.reduce((a, b) => a + b, 0) / verdictNumbers.length);

  const allKeywords = readings.flatMap((r) => r.verdict.keywords);
  const keywordCounts: Record<string, number> = {};
  for (const kw of allKeywords) {
    keywordCounts[kw] = (keywordCounts[kw] ?? 0) + 1;
  }
  const commonKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([kw]) => kw);

  const overallEssence =
    "Your numerological blueprint suggests a multifaceted personality with these resonant energies across your names.";

  return {
    dateOfBirth,
    readings,
    summary: {
      primaryVerdictNumber,
      commonKeywords,
      overallEssence,
    },
  };
}
