import { Item } from "./types";

export interface Outfit {
  id: string;
  items: Item[];
  vibe: string;
  dominantColors: string[];
  tags: string[];
  score: number;
}

export interface OutfitCombination {
  top?: Item;
  bottom?: Item;
  outerwear?: Item;
  footwear?: Item;
  accessories?: Item[];
  bags?: Item;
  jewelry?: Item[];
}

export class OutfitService {
  // Color compatibility matrix
  private static colorCompatibility: { [key: string]: string[] } = {
    black: [
      "white",
      "gray",
      "red",
      "blue",
      "pink",
      "yellow",
      "green",
      "purple",
      "brown",
      "beige",
    ],
    white: [
      "black",
      "gray",
      "red",
      "blue",
      "pink",
      "yellow",
      "green",
      "purple",
      "brown",
      "beige",
      "navy",
    ],
    gray: [
      "black",
      "white",
      "red",
      "blue",
      "pink",
      "yellow",
      "green",
      "purple",
      "navy",
    ],
    red: ["black", "white", "gray", "beige", "navy", "brown"],
    blue: ["white", "black", "gray", "beige", "brown", "yellow"],
    navy: ["white", "gray", "beige", "red", "pink"],
    pink: ["white", "black", "gray", "navy", "beige"],
    yellow: ["black", "white", "gray", "blue", "brown"],
    green: ["black", "white", "gray", "brown", "beige"],
    purple: ["black", "white", "gray", "beige"],
    brown: ["white", "beige", "yellow", "green", "blue", "black"],
    beige: [
      "black",
      "white",
      "gray",
      "red",
      "blue",
      "navy",
      "pink",
      "brown",
      "green",
      "purple",
    ],
  };

  // Style compatibility matrix
  private static styleCompatibility: { [key: string]: string[] } = {
    casual: ["casual", "comfortable", "trendy", "bohemian"],
    formal: ["formal", "business", "elegant"],
    business: ["business", "formal", "elegant"],
    party: ["party", "trendy", "elegant"],
    elegant: ["elegant", "formal", "business", "party"],
    trendy: ["trendy", "casual", "party"],
    comfortable: ["comfortable", "casual"],
    sporty: ["sporty", "comfortable", "casual"],
    bohemian: ["bohemian", "casual"],
    minimalist: ["minimalist", "elegant", "business"],
    vintage: ["vintage", "trendy"],
  };

  // Get items by category
  private static categorizeItems(items: Item[]): {
    [category: string]: Item[];
  } {
    const categorized: { [category: string]: Item[] } = {};

    items.forEach((item) => {
      const category = item.category.toLowerCase();
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(item);
    });

    return categorized;
  }

  // Check if two colors are compatible
  private static areColorsCompatible(color1: string, color2: string): boolean {
    const c1 = color1.toLowerCase().trim();
    const c2 = color2.toLowerCase().trim();

    return (
      this.colorCompatibility[c1]?.includes(c2) ||
      this.colorCompatibility[c2]?.includes(c1) ||
      c1 === c2
    );
  }

  // Check if styles are compatible
  private static areStylesCompatible(
    tags1: string[],
    tags2: string[]
  ): boolean {
    for (const tag1 of tags1) {
      for (const tag2 of tags2) {
        const t1 = tag1.toLowerCase();
        const t2 = tag2.toLowerCase();

        if (
          this.styleCompatibility[t1]?.includes(t2) ||
          this.styleCompatibility[t2]?.includes(t1) ||
          t1 === t2
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // Calculate compatibility score between two items
  private static calculateCompatibilityScore(item1: Item, item2: Item): number {
    let score = 0;

    // Color compatibility (40% weight)
    let colorMatch = false;
    if (item1.colors && item2.colors) {
      for (const color1 of item1.colors) {
        for (const color2 of item2.colors) {
          if (this.areColorsCompatible(color1, color2)) {
            colorMatch = true;
            break;
          }
        }
        if (colorMatch) break;
      }
    }
    if (colorMatch) score += 40;

    // Style compatibility (40% weight)
    if (
      item1.tags &&
      item2.tags &&
      this.areStylesCompatible(item1.tags, item2.tags)
    ) {
      score += 40;
    }

    // Same category penalty (to avoid wearing two tops, etc.)
    if (item1.category === item2.category) {
      score -= 50;
    }

    // Seasonal compatibility (20% weight)
    const seasonalTags = ["summer", "winter", "spring", "fall"];
    const item1Seasons =
      item1.tags?.filter((tag) => seasonalTags.includes(tag.toLowerCase())) ||
      [];
    const item2Seasons =
      item2.tags?.filter((tag) => seasonalTags.includes(tag.toLowerCase())) ||
      [];

    if (item1Seasons.length > 0 && item2Seasons.length > 0) {
      const hasCommonSeason = item1Seasons.some((s1) =>
        item2Seasons.some((s2) => s1.toLowerCase() === s2.toLowerCase())
      );
      if (hasCommonSeason) score += 20;
    } else {
      score += 10; // Neutral if no seasonal info
    }

    return Math.max(0, score);
  }

  // Generate outfit combinations
  private static generateCombinations(categorized: {
    [category: string]: Item[];
  }): OutfitCombination[] {
    const combinations: OutfitCombination[] = [];

    const tops = categorized["clothing"] || [];
    const outerwear = categorized["outerwear"] || [];
    const footwear = categorized["footwear"] || [];
    const accessories = categorized["accessories"] || [];
    const bags = categorized["bags"] || [];
    const jewelry = categorized["jewelry"] || [];

    // For simplicity, let's create basic combinations
    // In a real app, you'd have more sophisticated logic to distinguish tops vs bottoms
    for (let i = 0; i < Math.min(tops.length, 20); i++) {
      const combination: OutfitCombination = {
        top: tops[i],
        footwear: footwear[Math.floor(Math.random() * footwear.length)],
      };

      if (outerwear.length > 0 && Math.random() > 0.5) {
        combination.outerwear =
          outerwear[Math.floor(Math.random() * outerwear.length)];
      }

      if (accessories.length > 0 && Math.random() > 0.3) {
        combination.accessories = [
          accessories[Math.floor(Math.random() * accessories.length)],
        ];
      }

      if (bags.length > 0 && Math.random() > 0.4) {
        combination.bags = bags[Math.floor(Math.random() * bags.length)];
      }

      if (jewelry.length > 0 && Math.random() > 0.6) {
        combination.jewelry = [
          jewelry[Math.floor(Math.random() * jewelry.length)],
        ];
      }

      combinations.push(combination);
    }

    return combinations;
  }

  // Score an outfit combination
  private static scoreOutfit(combination: OutfitCombination): number {
    const items = Object.values(combination).flat().filter(Boolean) as Item[];

    if (items.length < 2) return 0;

    let totalScore = 0;
    let pairCount = 0;

    // Calculate pairwise compatibility scores
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        totalScore += this.calculateCompatibilityScore(items[i], items[j]);
        pairCount++;
      }
    }

    // Bonus for having a complete outfit
    if (combination.top && combination.footwear) totalScore += 20;
    if (combination.outerwear) totalScore += 10;
    if (combination.accessories && combination.accessories.length > 0)
      totalScore += 5;

    return pairCount > 0 ? totalScore / pairCount : 0;
  }

  // Determine outfit vibe based on tags
  private static determineVibe(items: Item[]): string {
    const allTags = items.flatMap((item) => item.tags || []);
    const tagCounts: { [tag: string]: number } = {};

    allTags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      tagCounts[lowerTag] = (tagCounts[lowerTag] || 0) + 1;
    });

    const dominantTag = Object.entries(tagCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    const vibeMap: { [key: string]: string } = {
      casual: "Casual & Comfortable",
      formal: "Formal & Professional",
      business: "Business Chic",
      party: "Party Ready",
      elegant: "Elegant & Sophisticated",
      trendy: "Trendy & Modern",
      comfortable: "Cozy & Comfortable",
      sporty: "Sporty & Active",
      bohemian: "Bohemian & Free-spirited",
      minimalist: "Minimalist & Clean",
      vintage: "Vintage & Retro",
    };

    return vibeMap[dominantTag] || "Mixed Style";
  }

  // Get dominant colors from outfit
  private static getDominantColors(items: Item[]): string[] {
    const allColors = items.flatMap((item) => item.colors || []);
    const colorCounts: { [color: string]: number } = {};

    allColors.forEach((color) => {
      const lowerColor = color.toLowerCase();
      colorCounts[lowerColor] = (colorCounts[lowerColor] || 0) + 1;
    });

    return Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([color]) => color);
  }

  // Generate random outfits
  static generateRandomOutfits(items: Item[], count = 5): Outfit[] {
    if (items.length < 2) return [];

    const categorized = this.categorizeItems(items);
    const combinations = this.generateCombinations(categorized);

    // Score and sort combinations
    const scoredOutfits = combinations
      .map((combination) => {
        const outfitItems = Object.values(combination)
          .flat()
          .filter(Boolean) as Item[];

        const score = this.scoreOutfit(combination);
        const vibe = this.determineVibe(outfitItems);
        const dominantColors = this.getDominantColors(outfitItems);
        const tags = [
          ...new Set(outfitItems.flatMap((item) => item.tags || [])),
        ];

        return {
          id: Math.random().toString(36).substr(2, 9),
          items: outfitItems,
          vibe,
          dominantColors,
          tags,
          score,
        };
      })
      .filter((outfit) => outfit.score > 30) // Only include decent outfits
      .sort((a, b) => b.score - a.score)
      .slice(0, count);

    return scoredOutfits;
  }

  // Generate outfit for specific occasion/vibe
  static generateOutfitForOccasion(
    items: Item[],
    occasion: string
  ): Outfit | null {
    const filteredItems = items.filter((item) =>
      item.tags?.some((tag) =>
        tag.toLowerCase().includes(occasion.toLowerCase())
      )
    );

    if (filteredItems.length < 2) {
      // Fall back to all items if no specific items found
      return this.generateRandomOutfits(items, 1)[0] || null;
    }

    const outfits = this.generateRandomOutfits(filteredItems, 1);
    return outfits[0] || null;
  }
}
