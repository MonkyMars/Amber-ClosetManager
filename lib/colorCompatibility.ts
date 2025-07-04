/**
 * Advanced Color Compatibility System for Fashion
 * Uses color theory, fashion psychology, and style harmony principles
 */

interface ColorHSL {
  h: number; // hue (0-360)
  s: number; // saturation (0-100)
  l: number; // lightness (0-100)
}

interface ColorProfile {
  hex: string;
  hsl: ColorHSL;
  temperature: "warm" | "cool" | "neutral";
  intensity: "vibrant" | "muted" | "neutral";
  category: "neutral" | "earth" | "jewel" | "pastel" | "bright" | "dark";
}

export class ColorCompatibilityEngine {
  // Convert hex to HSL
  private static hexToHsl(hex: string): ColorHSL {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  // Analyze color properties
  private static analyzeColor(hex: string): ColorProfile {
    const hsl = this.hexToHsl(hex);

    // Determine temperature
    let temperature: "warm" | "cool" | "neutral" = "neutral";
    if (hsl.h >= 0 && hsl.h <= 60) temperature = "warm"; // red-yellow
    else if (hsl.h >= 240 && hsl.h <= 300) temperature = "cool"; // blue-purple
    else if (hsl.h > 60 && hsl.h < 240) temperature = "cool"; // green-blue
    else if (hsl.h > 300) temperature = "warm"; // red

    // Neutrals (low saturation)
    if (hsl.s < 15) temperature = "neutral";

    // Determine intensity
    let intensity: "vibrant" | "muted" | "neutral" = "neutral";
    if (hsl.s > 70 && hsl.l > 30 && hsl.l < 80) intensity = "vibrant";
    else if (hsl.s < 30 || hsl.l > 85 || hsl.l < 20) intensity = "muted";

    // Determine category
    let category: "neutral" | "earth" | "jewel" | "pastel" | "bright" | "dark" =
      "neutral";

    if (hsl.s < 15) category = "neutral";
    else if (hsl.l > 80) category = "pastel";
    else if (hsl.l < 25) category = "dark";
    else if (hsl.s > 70 && hsl.l > 40 && hsl.l < 70) category = "jewel";
    else if (hsl.s > 80 && hsl.l > 50) category = "bright";
    else if (hsl.s < 50 && hsl.l > 30 && hsl.l < 70) category = "earth";

    return { hex, hsl, temperature, intensity, category };
  }

  // Calculate color compatibility score (0-100)
  public static calculateColorCompatibility(
    color1: string,
    color2: string
  ): number {
    const profile1 = this.analyzeColor(color1);
    const profile2 = this.analyzeColor(color2);

    let score = 0;

    // Rule 1: Neutrals go with everything (high score)
    if (profile1.category === "neutral" || profile2.category === "neutral") {
      score += 40;
    }

    // Rule 2: Same temperature harmony
    if (profile1.temperature === profile2.temperature) {
      score += 25;
    }

    // Rule 3: Complementary colors (opposite on color wheel)
    const hueDiff = Math.abs(profile1.hsl.h - profile2.hsl.h);
    const complementaryDiff = Math.min(hueDiff, 360 - hueDiff);
    if (complementaryDiff > 150 && complementaryDiff < 210) {
      score += 30;
    }

    // Rule 4: Analogous colors (close on color wheel)
    if (complementaryDiff < 60) {
      score += 20;
    }

    // Rule 5: Monochromatic harmony (same hue, different saturation/lightness)
    if (complementaryDiff < 30) {
      const satDiff = Math.abs(profile1.hsl.s - profile2.hsl.s);
      const lightDiff = Math.abs(profile1.hsl.l - profile2.hsl.l);
      if (satDiff > 20 || lightDiff > 20) {
        score += 25;
      }
    }

    // Rule 6: Intensity balance
    if (profile1.intensity === "vibrant" && profile2.intensity === "muted") {
      score += 15;
    } else if (profile1.intensity === profile2.intensity) {
      score += 10;
    }

    // Rule 7: Earth tones + jewel tones combination
    if (
      (profile1.category === "earth" && profile2.category === "jewel") ||
      (profile1.category === "jewel" && profile2.category === "earth")
    ) {
      score += 20;
    }

    // Rule 8: Pastels work well together
    if (profile1.category === "pastel" && profile2.category === "pastel") {
      score += 15;
    }

    // Rule 9: Avoid clashing brights
    if (
      profile1.category === "bright" &&
      profile2.category === "bright" &&
      complementaryDiff > 60 &&
      complementaryDiff < 150
    ) {
      score -= 30;
    }

    // Rule 10: Classic combinations
    const classicCombos = [
      ["#000000", "#FFFFFF"], // black & white
      ["#000080", "#FFFFFF"], // navy & white
      ["#000000", "#FFD700"], // black & gold
      ["#8B4513", "#FFFFFF"], // brown & white
      ["#008000", "#8B4513"], // green & brown
      ["#000080", "#DAA520"], // navy & gold
    ];

    for (const combo of classicCombos) {
      if (
        combo.includes(color1.toUpperCase()) &&
        combo.includes(color2.toUpperCase())
      ) {
        score += 35;
        break;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  // Get best color matches for a given color
  public static getBestMatches(
    targetColor: string,
    availableColors: string[]
  ): string[] {
    const colorScores = availableColors
      .filter((color) => color !== targetColor)
      .map((color) => ({
        color,
        score: this.calculateColorCompatibility(targetColor, color),
      }))
      .sort((a, b) => b.score - a.score);

    return colorScores.slice(0, 3).map((item) => item.color);
  }

  // Calculate overall outfit color harmony
  public static calculateOutfitHarmony(colors: string[]): number {
    if (colors.length < 2) return 100;

    const pairs: number[] = [];
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        pairs.push(this.calculateColorCompatibility(colors[i], colors[j]));
      }
    }

    const avgScore =
      pairs.reduce((sum, score) => sum + score, 0) / pairs.length;

    // Bonus for having 1-2 neutrals in the outfit
    const profiles = colors.map((color) => this.analyzeColor(color));
    const neutralCount = profiles.filter(
      (p) => p.category === "neutral"
    ).length;
    let neutralBonus = 0;
    if (neutralCount === 1) neutralBonus = 10;
    else if (neutralCount === 2) neutralBonus = 5;

    return Math.min(100, avgScore + neutralBonus);
  }

  // Suggest complementary colors for an outfit
  public static suggestColors(existingColors: string[]): string[] {
    const suggestions = [
      // Neutrals (always good)
      "#000000",
      "#FFFFFF",
      "#808080",
      "#F5F5F5",
      "#8B4513",

      // Classic colors
      "#000080",
      "#DAA520",
      "#008000",
      "#800000",
      "#2F4F4F",

      // Earth tones
      "#DEB887",
      "#CD853F",
      "#A0522D",
      "#556B2F",
      "#6B8E23",
    ];

    if (existingColors.length === 0) return suggestions.slice(0, 5);

    const scored = suggestions
      .filter((color) => !existingColors.includes(color))
      .map((color) => {
        const scores = existingColors.map((existing) =>
          this.calculateColorCompatibility(color, existing)
        );
        const avgScore =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return { color, score: avgScore };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 5).map((item) => item.color);
  }
}
