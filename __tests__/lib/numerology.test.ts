import {
  getLetterValue,
  reduceToSingleDigit,
  getDigitSum,
  calculateNameNumber,
  calculateLifePathNumber,
  calculateDestinyNumber,
  calculateChain,
  generateVerdict,
  generateReading,
  generateNameVariants,
  generateProfile,
} from "@/lib/numerology";

describe("Numerology Utilities", () => {
  describe("getLetterValue", () => {
    it("should return correct values for letters A-I", () => {
      expect(getLetterValue("A")).toBe(1);
      expect(getLetterValue("B")).toBe(2);
      expect(getLetterValue("I")).toBe(9);
    });

    it("should return correct values for letters J-R", () => {
      expect(getLetterValue("J")).toBe(1);
      expect(getLetterValue("K")).toBe(2);
      expect(getLetterValue("R")).toBe(9);
    });

    it("should return correct values for letters S-Z", () => {
      expect(getLetterValue("S")).toBe(1);
      expect(getLetterValue("T")).toBe(2);
      expect(getLetterValue("Z")).toBe(8);
    });

    it("should be case-insensitive", () => {
      expect(getLetterValue("a")).toBe(1);
      expect(getLetterValue("A")).toBe(1);
      expect(getLetterValue("z")).toBe(8);
      expect(getLetterValue("Z")).toBe(8);
    });

    it("should return 0 for non-letter characters", () => {
      expect(getLetterValue("1")).toBe(0);
      expect(getLetterValue(" ")).toBe(0);
      expect(getLetterValue("-")).toBe(0);
    });
  });

  describe("reduceToSingleDigit", () => {
    it("should return single digits unchanged", () => {
      expect(reduceToSingleDigit(1)).toBe(1);
      expect(reduceToSingleDigit(9)).toBe(9);
    });

    it("should reduce double digits correctly", () => {
      expect(reduceToSingleDigit(10)).toBe(1); // 1+0
      expect(reduceToSingleDigit(18)).toBe(9); // 1+8
      expect(reduceToSingleDigit(25)).toBe(7); // 2+5
    });

    it("should reduce larger numbers correctly", () => {
      expect(reduceToSingleDigit(123)).toBe(6); // 1+2+3 = 6
      expect(reduceToSingleDigit(999)).toBe(9); // 9+9+9 = 27 -> 2+7 = 9
    });

    it("should handle zero", () => {
      expect(reduceToSingleDigit(0)).toBe(0);
    });
  });

  describe("getDigitSum", () => {
    it("should return the sum of digits", () => {
      expect(getDigitSum(123)).toBe(6);
      expect(getDigitSum(999)).toBe(27);
      expect(getDigitSum(42)).toBe(6);
    });

    it("should handle single digits", () => {
      expect(getDigitSum(5)).toBe(5);
      expect(getDigitSum(0)).toBe(0);
    });
  });

  describe("calculateNameNumber", () => {
    it("should calculate name numbers correctly", () => {
      const result = calculateNameNumber("JOHN");
      expect(result.raw).toBe(1 + 6 + 8 + 5); // J+O+H+N = 1+6+8+5 = 20
      expect(result.reduced).toBe(2); // 2+0 = 2
    });

    it("should be case-insensitive", () => {
      const upper = calculateNameNumber("JOHN");
      const lower = calculateNameNumber("john");
      expect(upper.raw).toBe(lower.raw);
      expect(upper.reduced).toBe(lower.reduced);
    });

    it("should ignore spaces", () => {
      const withSpace = calculateNameNumber("JOH N");
      const withoutSpace = calculateNameNumber("JOHN");
      expect(withSpace.raw).toBe(withoutSpace.raw);
    });
  });

  describe("calculateLifePathNumber", () => {
    it("should calculate life path number from date of birth", () => {
      const result = calculateLifePathNumber("1990-01-01");
      expect(result).toHaveProperty("raw");
      expect(result).toHaveProperty("reduced");
      expect(result.reduced).toBeGreaterThanOrEqual(1);
      expect(result.reduced).toBeLessThanOrEqual(9);
    });

    it("should handle different dates", () => {
      const result1 = calculateLifePathNumber("1985-05-15");
      const result2 = calculateLifePathNumber("1995-12-25");
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  describe("calculateDestinyNumber", () => {
    it("should calculate destiny number from name and DOB", () => {
      const result = calculateDestinyNumber("JOHN", "1990-01-01");
      expect(result).toHaveProperty("raw");
      expect(result).toHaveProperty("reduced");
      expect(result.reduced).toBeGreaterThanOrEqual(1);
      expect(result.reduced).toBeLessThanOrEqual(9);
    });

    it("should combine name and life path numbers", () => {
      const nameNum = calculateNameNumber("JOHN");
      const lpNum = calculateLifePathNumber("1990-01-01");
      const destinyNum = calculateDestinyNumber("JOHN", "1990-01-01");

      // Destiny should be derived from name + life path
      expect(destinyNum.raw).toBeGreaterThanOrEqual(nameNum.raw + lpNum.raw);
    });
  });

  describe("calculateChain", () => {
    it("should generate a valid numerology chain", () => {
      const chain = calculateChain("JOHN", "1990-01-01");

      expect(chain).toHaveProperty("step1_nameNumber");
      expect(chain).toHaveProperty("step2_lifePathNumber");
      expect(chain).toHaveProperty("step3_destinyNumber");
      expect(chain).toHaveProperty("step4_expression");
      expect(chain).toHaveProperty("final_verdict");

      // All should be single digits 1-9
      expect(chain.step1_nameNumber).toBeGreaterThanOrEqual(1);
      expect(chain.step1_nameNumber).toBeLessThanOrEqual(9);
      expect(chain.final_verdict).toBeGreaterThanOrEqual(1);
      expect(chain.final_verdict).toBeLessThanOrEqual(9);
    });
  });

  describe("generateVerdict", () => {
    it("should generate verdict for each number 1-9", () => {
      for (let i = 1; i <= 9; i++) {
        const verdict = generateVerdict(i);
        expect(verdict).toHaveProperty("archetype");
        expect(verdict).toHaveProperty("keywords");
        expect(verdict).toHaveProperty("essence");
        expect(verdict).toHaveProperty("strength");
        expect(verdict).toHaveProperty("challenge");
        expect(verdict).toHaveProperty("guidance");

        expect(verdict.keywords).toBeInstanceOf(Array);
        expect(verdict.keywords.length).toBeGreaterThan(0);
      }
    });

    it("should have different archetypes for different numbers", () => {
      const v1 = generateVerdict(1);
      const v2 = generateVerdict(2);
      const v9 = generateVerdict(9);

      expect(v1.archetype).not.toBe(v2.archetype);
      expect(v2.archetype).not.toBe(v9.archetype);
    });
  });

  describe("generateReading", () => {
    it("should generate a complete reading", () => {
      const reading = generateReading("JOHN", "1990-01-01");

      expect(reading).toHaveProperty("name");
      expect(reading).toHaveProperty("dateOfBirth");
      expect(reading).toHaveProperty("chain");
      expect(reading).toHaveProperty("verdict");
      expect(reading).toHaveProperty("reading");

      expect(reading.name).toBe("JOHN");
      expect(reading.reading).toContain("JOHN");
    });

    it("should include chain information in reading", () => {
      const reading = generateReading("JOHN", "1990-01-01");
      expect(reading.reading).toContain("Name Number");
      expect(reading.reading).toContain("Life Path");
      expect(reading.reading).toContain("Destiny Number");
    });
  });

  describe("generateNameVariants", () => {
    it("should extract first and last names from full name", () => {
      const variants = generateNameVariants("John Michael Smith", "");

      const names = variants.map((v) => v.name.toUpperCase());
      expect(names).toContain("JOHN MICHAEL SMITH");
      expect(names).toContain("JOHN");
      expect(names).toContain("SMITH");
      expect(names).toContain("MICHAEL");
    });

    it("should add alternate names", () => {
      const variants = generateNameVariants("John Smith", "Johnny, Jack");

      const names = variants.map((v) => v.name.toUpperCase());
      expect(names).toContain("JOHNNY");
      expect(names).toContain("JACK");
    });

    it("should handle comma-separated alternates", () => {
      const variants = generateNameVariants("John Smith", "Johnny, Jack, J");

      expect(variants.length).toBeGreaterThanOrEqual(5);
    });

    it("should handle semicolon and pipe-separated alternates", () => {
      const variants1 = generateNameVariants("John Smith", "Johnny; Jack");
      const variants2 = generateNameVariants("John Smith", "Johnny | Jack");

      expect(variants1.length).toBeGreaterThanOrEqual(4);
      expect(variants2.length).toBeGreaterThanOrEqual(4);
    });

    it("should deduplicate variants", () => {
      const variants = generateNameVariants("John John", "John");

      const names = variants.map((v) => v.name.toUpperCase());
      const johnCount = names.filter((n) => n === "JOHN").length;
      expect(johnCount).toBe(1);
    });

    it("should handle single name", () => {
      const variants = generateNameVariants("John", "");

      expect(variants.length).toBeGreaterThanOrEqual(1);
      expect(variants[0].name).toBe("John");
    });
  });

  describe("generateProfile", () => {
    it("should generate a complete numerology profile", () => {
      const profile = generateProfile("John Michael Smith", "1990-01-01", "Johnny, Jack");

      expect(profile).toHaveProperty("dateOfBirth");
      expect(profile).toHaveProperty("readings");
      expect(profile).toHaveProperty("summary");

      expect(profile.dateOfBirth).toBe("1990-01-01");
      expect(profile.readings.length).toBeGreaterThanOrEqual(1);
    });

    it("should generate multiple readings for different name variants", () => {
      const profile = generateProfile(
        "John Michael Smith",
        "1990-01-01",
        "Johnny, Jack"
      );

      expect(profile.readings.length).toBeGreaterThan(1);

      // All readings should have the same DOB
      for (const reading of profile.readings) {
        expect(reading.dateOfBirth).toBe("1990-01-01");
      }
    });

    it("should calculate summary statistics", () => {
      const profile = generateProfile(
        "John Michael Smith",
        "1990-01-01",
        "Johnny, Jack"
      );

      expect(profile.summary).toHaveProperty("primaryVerdictNumber");
      expect(profile.summary).toHaveProperty("commonKeywords");
      expect(profile.summary).toHaveProperty("overallEssence");

      expect(profile.summary.primaryVerdictNumber).toBeGreaterThanOrEqual(1);
      expect(profile.summary.primaryVerdictNumber).toBeLessThanOrEqual(9);
      expect(profile.summary.commonKeywords).toBeInstanceOf(Array);
    });

    it("should have common keywords from all readings", () => {
      const profile = generateProfile(
        "John Michael Smith",
        "1990-01-01",
        "Johnny"
      );

      expect(profile.summary.commonKeywords.length).toBeGreaterThan(0);
      expect(profile.summary.commonKeywords.length).toBeLessThanOrEqual(5);
    });
  });
});
