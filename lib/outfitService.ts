import { Item } from "./types";
import { ColorCompatibilityEngine } from "./colorCompatibility";
import { OutfitCompatibilityEngine } from "./outfitCompatibility";
import { OUTFIT_CONSTANTS, SCORING_CONSTANTS } from "./constants";

export interface Outfit {
  id: string;
  items: Item[];
  vibe: string;
  dominantColors: string[];
  tags: string[];
  score: number;
  colorHarmony: number;
  completeness: number;
  styleCoherence: number;
}

export interface OutfitAnalysis {
  colorHarmony: number;
  completeness: number;
  styleCoherence: number;
  conflicts: string[];
  suggestions: string[];
  overallScore: number;
}

export class OutfitService {
  // Generate fashionable outfits with advanced algorithms
  static generateOutfits(
    items: Item[],
    count: number = OUTFIT_CONSTANTS.DEFAULT_OUTFIT_COUNT
  ): Outfit[] {
    if (items.length < OUTFIT_CONSTANTS.MIN_ITEMS_FOR_GENERATION) return [];

    const outfits: Outfit[] = [];
    const maxAttempts = count * 10; // Try more combinations to find good ones

    for (
      let attempt = 0;
      attempt < maxAttempts && outfits.length < count;
      attempt++
    ) {
      const outfit = this.generateSingleOutfit(items);
      if (outfit && outfit.score >= OUTFIT_CONSTANTS.MIN_OUTFIT_SCORE) {
        // Only keep good outfits
        // Check if this outfit is too similar to existing ones
        const isSimilar = outfits.some((existing) =>
          this.outfitsSimilar(outfit, existing)
        );

        if (!isSimilar) {
          outfits.push(outfit);
        }
      }
    }

    return outfits.sort((a, b) => b.score - a.score);
  }

  // Generate a single, well-coordinated outfit
  private static generateSingleOutfit(items: Item[]): Outfit | null {
    const selectedItems: Item[] = [];
    const availableItems = [...items];

    // Step 1: Select a foundation piece (dress or top+bottom)
    const foundations = availableItems.filter((item) => {
      const category = OutfitCompatibilityEngine.categorizeItem(
        item.name,
        item.category,
        item.tags
      );
      return category?.name === "dress" || category?.name === "jumpsuit";
    });

    if (
      foundations.length > 0 &&
      Math.random() < OUTFIT_CONSTANTS.DRESS_FOUNDATION_CHANCE
    ) {
      // 30% chance to build around a dress/jumpsuit
      const foundation =
        foundations[Math.floor(Math.random() * foundations.length)];
      selectedItems.push(foundation);
      this.removeItem(availableItems, foundation);
    } else {
      // Build with separates
      // Select top
      const tops = availableItems.filter((item) => {
        const category = OutfitCompatibilityEngine.categorizeItem(
          item.name,
          item.category,
          item.tags
        );
        return (
          category?.type === "base" &&
          category.name !== "dress" &&
          category.name !== "jumpsuit"
        );
      });

      if (tops.length > 0) {
        const top = tops[Math.floor(Math.random() * tops.length)];
        selectedItems.push(top);
        this.removeItem(availableItems, top);
      }

      // Select bottom
      const bottoms = availableItems.filter((item) => {
        const category = OutfitCompatibilityEngine.categorizeItem(
          item.name,
          item.category,
          item.tags
        );
        return category?.type === "bottom";
      });

      if (bottoms.length > 0) {
        const bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
        selectedItems.push(bottom);
        this.removeItem(availableItems, bottom);
      }
    }

    if (selectedItems.length === 0) return null;

    // Step 2: Add shoes (essential)
    const shoes = availableItems.filter((item) => {
      const category = OutfitCompatibilityEngine.categorizeItem(
        item.name,
        item.category,
        item.tags
      );
      return category?.type === "shoes";
    });

    if (shoes.length > 0) {
      // Filter shoes that match the outfit colors
      const compatibleShoes = shoes.filter((shoe) =>
        this.isColorCompatibleWithOutfit(shoe, selectedItems)
      );

      const shoesToChooseFrom =
        compatibleShoes.length > 0 ? compatibleShoes : shoes;
      const selectedShoe =
        shoesToChooseFrom[Math.floor(Math.random() * shoesToChooseFrom.length)];
      selectedItems.push(selectedShoe);
      this.removeItem(availableItems, selectedShoe);
    }

    // Step 3: Add outerwear (optional, based on style)
    if (Math.random() < OUTFIT_CONSTANTS.OUTERWEAR_CHANCE) {
      // 40% chance to add outerwear
      const outerwear = this.selectCompatibleItems(
        availableItems.filter((item) => {
          const category = OutfitCompatibilityEngine.categorizeItem(
            item.name,
            item.category,
            item.tags
          );
          return category?.type === "outer" || category?.type === "layer";
        }),
        selectedItems,
        1
      );
      selectedItems.push(...outerwear);
    }

    // Step 4: Add accessories (1-3 pieces)
    const accessoryCount =
      Math.floor(
        Math.random() *
          (OUTFIT_CONSTANTS.ACCESSORY_RANGE.max -
            OUTFIT_CONSTANTS.ACCESSORY_RANGE.min +
            1)
      ) + OUTFIT_CONSTANTS.ACCESSORY_RANGE.min;
    const accessories = availableItems.filter((item) => {
      const category = OutfitCompatibilityEngine.categorizeItem(
        item.name,
        item.category,
        item.tags
      );
      return category?.type === "accessory";
    });

    const selectedAccessories = this.selectCompatibleItems(
      accessories,
      selectedItems,
      accessoryCount
    );
    selectedItems.push(...selectedAccessories);

    // Validate minimum outfit requirements
    const hasShoes = selectedItems.some((item) => {
      const category = OutfitCompatibilityEngine.categorizeItem(
        item.name,
        item.category,
        item.tags
      );
      return category?.type === "shoes";
    });

    const hasDress = selectedItems.some((item) => {
      const category = OutfitCompatibilityEngine.categorizeItem(
        item.name,
        item.category,
        item.tags
      );
      return category?.name === "dress" || category?.name === "jumpsuit";
    });

    const hasTop = selectedItems.some((item) => {
      const category = OutfitCompatibilityEngine.categorizeItem(
        item.name,
        item.category,
        item.tags
      );
      return (
        category?.type === "base" &&
        category.name !== "dress" &&
        category.name !== "jumpsuit"
      );
    });

    const hasBottom = selectedItems.some((item) => {
      const category = OutfitCompatibilityEngine.categorizeItem(
        item.name,
        item.category,
        item.tags
      );
      return category?.type === "bottom";
    });

    // An outfit needs either: (top + bottom) or dress, and preferably shoes
    const hasValidBase = hasDress || (hasTop && hasBottom);
    if (!hasValidBase || selectedItems.length < 2) return null;

    // Log warning if no shoes (but don't reject the outfit entirely)
    if (!hasShoes && selectedItems.length > 0) {
      console.warn("Generated outfit without shoes - this may not be complete");
    }

    // Step 5: Analyze and score the outfit
    const analysis = this.analyzeOutfit(selectedItems);

    if (analysis.overallScore < 40) return null; // Reject poor outfits

    // Create outfit object
    const outfit: Outfit = {
      id: this.generateOutfitId(),
      items: selectedItems,
      vibe: this.determineVibe(selectedItems),
      dominantColors: this.extractDominantColors(selectedItems),
      tags: this.extractTags(selectedItems),
      score: analysis.overallScore,
      colorHarmony: analysis.colorHarmony,
      completeness: analysis.completeness,
      styleCoherence: analysis.styleCoherence,
    };

    return outfit;
  }

  // Check if an item's colors are compatible with the current outfit
  private static isColorCompatibleWithOutfit(
    item: Item,
    outfitItems: Item[]
  ): boolean {
    if (outfitItems.length === 0) return true;

    const outfitColors = outfitItems.flatMap((i) => i.colors);

    for (const itemColor of item.colors) {
      const hasCompatibleColor = outfitColors.some(
        (outfitColor) =>
          ColorCompatibilityEngine.calculateColorCompatibility(
            itemColor,
            outfitColor
          ) >= 60
      );
      if (hasCompatibleColor) return true;
    }

    return false;
  }

  // Select compatible items using advanced filtering
  private static selectCompatibleItems(
    candidates: Item[],
    existingItems: Item[],
    maxCount: number
  ): Item[] {
    // Filter out items that would conflict
    const compatibleCandidates =
      OutfitCompatibilityEngine.filterCompatibleItems(
        existingItems.map((item) => ({
          name: item.name,
          category: item.category,
          tags: item.tags,
        })),
        candidates.map((item) => ({
          name: item.name,
          category: item.category,
          tags: item.tags,
        }))
      );

    // Convert back to Item objects
    const compatibleItems = candidates.filter((item) =>
      compatibleCandidates.some(
        (compatible) =>
          compatible.name === item.name && compatible.category === item.category
      )
    );

    // Score and select best items
    const scoredItems = compatibleItems
      .map((item) => ({
        item,
        score: this.calculateItemCompatibilityScore(item, existingItems),
      }))
      .sort((a, b) => b.score - a.score);

    return scoredItems.slice(0, maxCount).map((scored) => scored.item);
  }

  // Calculate how well an item fits with existing outfit items
  private static calculateItemCompatibilityScore(
    item: Item,
    existingItems: Item[]
  ): number {
    if (existingItems.length === 0) return 50;

    let totalScore = 0;
    const existingColors = existingItems.flatMap((i) => i.colors);

    // Color compatibility
    let colorScore = 0;
    for (const itemColor of item.colors) {
      const bestColorMatch = Math.max(
        ...existingColors.map((existingColor) =>
          ColorCompatibilityEngine.calculateColorCompatibility(
            itemColor,
            existingColor
          )
        )
      );
      colorScore = Math.max(colorScore, bestColorMatch);
    }
    totalScore += colorScore * SCORING_CONSTANTS.COLOR_COMPATIBILITY_WEIGHT;

    // Tag/style compatibility
    const existingTags = existingItems.flatMap((i) => i.tags);
    const commonTags = item.tags.filter((tag) => existingTags.includes(tag));
    const tagScore = Math.min(
      100,
      (commonTags.length / Math.max(item.tags.length, 1)) * 100
    );
    totalScore += tagScore * SCORING_CONSTANTS.TAG_COMPATIBILITY_WEIGHT;

    return totalScore;
  }

  // Comprehensive outfit analysis
  static analyzeOutfit(items: Item[]): OutfitAnalysis {
    // Color harmony analysis
    const allColors = items.flatMap((item) => item.colors);
    const colorHarmony =
      allColors.length > 1
        ? ColorCompatibilityEngine.calculateOutfitHarmony(allColors)
        : 100;

    // Completeness analysis
    const completeness = OutfitCompatibilityEngine.scoreOutfitCompleteness(
      items.map((item) => ({
        name: item.name,
        category: item.category,
        tags: item.tags,
      }))
    );

    // Style coherence analysis
    const styleCoherence = this.calculateStyleCoherence(items);

    // Conflict analysis
    const validation = OutfitCompatibilityEngine.validateOutfitCombination(
      items.map((item) => ({
        name: item.name,
        category: item.category,
        tags: item.tags,
      }))
    );

    // Calculate overall score
    const overallScore = Math.round(
      colorHarmony * SCORING_CONSTANTS.COLOR_HARMONY_WEIGHT +
        completeness * SCORING_CONSTANTS.COMPLETENESS_WEIGHT +
        styleCoherence * SCORING_CONSTANTS.STYLE_COHERENCE_WEIGHT
    );

    return {
      colorHarmony,
      completeness,
      styleCoherence,
      conflicts: validation.conflicts,
      suggestions: validation.suggestions,
      overallScore,
    };
  }

  // Calculate style coherence based on tags and vibes
  private static calculateStyleCoherence(items: Item[]): number {
    const allTags = items.flatMap((item) => item.tags);
    const tagCounts: Record<string, number> = {};

    allTags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Style groups that work well together
    const styleGroups = [
      ["casual", "comfort", "everyday", "relaxed"],
      ["formal", "business", "professional", "dress"],
      ["edgy", "rock", "leather", "bold"],
      ["romantic", "feminine", "floral", "soft"],
      ["sporty", "athletic", "active", "gym"],
      ["bohemian", "boho", "flowy", "earthy"],
      ["vintage", "retro", "classic", "timeless"],
    ];

    let maxGroupScore = 0;
    for (const group of styleGroups) {
      const groupScore = group.reduce(
        (score, tag) => score + (tagCounts[tag] || 0),
        0
      );
      maxGroupScore = Math.max(maxGroupScore, groupScore);
    }

    // Normalize score
    const totalItems = items.length;
    return Math.min(100, (maxGroupScore / totalItems) * 50 + 50);
  }

  // Helper methods
  private static removeItem(array: Item[], item: Item): void {
    const index = array.findIndex((i) => i.id === item.id);
    if (index > -1) array.splice(index, 1);
  }

  private static generateOutfitId(): string {
    return "outfit_" + Math.random().toString(36).substr(2, 9);
  }

  private static determineVibe(items: Item[]): string {
    const allTags = items.flatMap((item) => item.tags);
    const tagCounts: Record<string, number> = {};

    allTags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    const vibes = [
      "casual",
      "formal",
      "edgy",
      "romantic",
      "sporty",
      "bohemian",
      "professional",
    ];
    let dominantVibe = "casual";
    let maxCount = 0;

    for (const vibe of vibes) {
      const count = tagCounts[vibe] || 0;
      if (count > maxCount) {
        maxCount = count;
        dominantVibe = vibe;
      }
    }

    return dominantVibe;
  }

  private static extractDominantColors(items: Item[]): string[] {
    const colorCounts: Record<string, number> = {};

    items.forEach((item) => {
      item.colors.forEach((color) => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });
    });

    return Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([color]) => color);
  }

  private static extractTags(items: Item[]): string[] {
    const tagCounts: Record<string, number> = {};

    items.forEach((item) => {
      item.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  private static outfitsSimilar(outfit1: Outfit, outfit2: Outfit): boolean {
    const items1 = outfit1.items.map((i) => i.id).sort();
    const items2 = outfit2.items.map((i) => i.id).sort();

    // Check if more than 70% of items are the same
    const commonItems = items1.filter((id) => items2.includes(id));
    const similarity =
      commonItems.length / Math.max(items1.length, items2.length);

    return similarity > 0.7;
  }

  // Generate outfit based on specific mood/vibe
  static generateMoodBasedOutfit(
    items: Item[],
    mood: string,
    colors: string[]
  ): Outfit | null {
    // Filter items that match the mood
    const moodItems = items.filter(
      (item) =>
        item.tags.some((tag) =>
          tag.toLowerCase().includes(mood.toLowerCase())
        ) || item.description.toLowerCase().includes(mood.toLowerCase())
    );

    // If not enough mood-specific items, use all items but prefer mood-matching ones
    const itemsToUse = moodItems.length >= 3 ? moodItems : items;

    // Generate outfit with color preference
    const outfits = this.generateOutfits(itemsToUse, 5);

    if (outfits.length === 0) return null;

    // Score outfits based on color match with mood
    const scoredOutfits = outfits.map((outfit) => {
      let colorMatchScore = 0;
      const outfitColors = outfit.items.flatMap((item) => item.colors);

      for (const moodColor of colors) {
        const bestMatch = Math.max(
          ...outfitColors.map((outfitColor) =>
            ColorCompatibilityEngine.calculateColorCompatibility(
              moodColor,
              outfitColor
            )
          ),
          0
        );
        colorMatchScore += bestMatch;
      }

      const avgColorMatch = colorMatchScore / colors.length;
      const finalScore = outfit.score * 0.7 + avgColorMatch * 0.3;

      return { ...outfit, score: finalScore };
    });

    return scoredOutfits.sort((a, b) => b.score - a.score)[0];
  }
}
