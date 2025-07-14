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
    count: number = OUTFIT_CONSTANTS.DEFAULT_OUTFIT_COUNT,
    occasion?: string
  ): Outfit[] {
    if (items.length < OUTFIT_CONSTANTS.MIN_ITEMS_FOR_GENERATION) return [];

    const outfits: Outfit[] = [];
    const maxAttempts = count * 30; // Increase attempts for more variety
    const usedCoreItems = new Set<string>(); // Track used core items (pants, tops, dresses)

    // Shuffle items array to prevent deterministic ordering
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);

    for (
      let attempt = 0;
      attempt < maxAttempts && outfits.length < count;
      attempt++
    ) {
      // Re-shuffle items each attempt for more randomness
      const currentItems = [...shuffledItems].sort(() => Math.random() - 0.5);

      // Filter out already used core items for better variety
      const availableItems = currentItems.filter((item) => {
        const category = OutfitCompatibilityEngine.categorizeItem(
          item.name,
          item.category,
          item.tags
        );
        const isCoreItem =
          category?.type === "bottom" ||
          category?.type === "base" ||
          category?.name === "dress" ||
          category?.name === "jumpsuit";

        // If it's a core item and already used, skip it (unless we're running low on options)
        if (isCoreItem && item.id && usedCoreItems.has(item.id)) {
          // Allow reuse if we've used more than half of available core items
          const coreItemsCount = currentItems.filter((i) => {
            const cat = OutfitCompatibilityEngine.categorizeItem(
              i.name,
              i.category,
              i.tags
            );
            return (
              cat?.type === "bottom" ||
              cat?.type === "base" ||
              cat?.name === "dress" ||
              cat?.name === "jumpsuit"
            );
          }).length;
          return usedCoreItems.size < coreItemsCount * 0.6;
        }

        return true;
      });

      const outfit = this.generateSingleOutfit(availableItems, occasion);
      if (outfit && outfit.score >= OUTFIT_CONSTANTS.MIN_OUTFIT_SCORE) {
        // Check if this outfit is too similar to existing ones
        const isSimilar = outfits.some((existing) =>
          this.outfitsSimilar(outfit, existing)
        );

        if (!isSimilar) {
          outfits.push(outfit);

          // Track used core items
          outfit.items.forEach((item) => {
            const category = OutfitCompatibilityEngine.categorizeItem(
              item.name,
              item.category,
              item.tags
            );
            const isCoreItem =
              category?.type === "bottom" ||
              category?.type === "base" ||
              category?.name === "dress" ||
              category?.name === "jumpsuit";

            if (isCoreItem && item.id) {
              usedCoreItems.add(item.id);
            }
          });
        }
      }
    }

    return outfits.sort((a, b) => b.score - a.score);
  }

  // Generate a single, well-coordinated outfit
  private static generateSingleOutfit(
    items: Item[],
    occasion?: string
  ): Outfit | null {
    const selectedItems: Item[] = [];
    const availableItems = [...items];

    // Step 1: Select a foundation piece based on occasion
    const shouldBuildWithDress = this.shouldUseDress(occasion);

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
      (shouldBuildWithDress ||
        Math.random() < OUTFIT_CONSTANTS.DRESS_FOUNDATION_CHANCE)
    ) {
      // Build around a dress/jumpsuit - shuffle foundations for randomness
      const shuffledFoundations = [...foundations].sort(
        () => Math.random() - 0.5
      );
      const foundation = shuffledFoundations[0];
      selectedItems.push(foundation);
      this.removeItem(availableItems, foundation);
    } else {
      // Build with separates - apply T-shirt layering logic
      const shouldUseStandaloneTshirt = this.shouldTshirtBeStandalone(
        occasion,
        items
      );

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

        // If it's a t-shirt and should be standalone, skip adding layers for now
        const isTshirt =
          top.category.toLowerCase().includes("tshirt") ||
          top.tags.some((tag) => tag.toLowerCase().includes("tshirt"));

        if (isTshirt && shouldUseStandaloneTshirt) {
          // Mark that we're doing a standalone t-shirt look
          // We'll skip adding layers in step 3
        }
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

    // Step 3: Add outerwear/layers (with smarter logic)
    const hasTshirt = selectedItems.some(
      (item) =>
        item.category.toLowerCase().includes("tshirt") ||
        item.tags.some((tag) => tag.toLowerCase().includes("tshirt"))
    );

    const shouldUseStandaloneTshirt = this.shouldTshirtBeStandalone(
      occasion,
      items
    );
    const shouldSkipLayers = hasTshirt && shouldUseStandaloneTshirt;

    if (
      !shouldSkipLayers &&
      Math.random() < OUTFIT_CONSTANTS.OUTERWEAR_CHANCE
    ) {
      const outerwearCandidates = availableItems.filter((item) => {
        const category = OutfitCompatibilityEngine.categorizeItem(
          item.name,
          item.category,
          item.tags
        );
        return category?.type === "outer" || category?.type === "layer";
      });

      // Debug logging for dress + vest issue
      const hasDress = selectedItems.some((item) => {
        const category = OutfitCompatibilityEngine.categorizeItem(
          item.name,
          item.category,
          item.tags
        );
        return category?.name === "dress";
      });

      if (hasDress) {
        console.log("Debug: Outfit has dress, filtering outerwear candidates");
        console.log(
          "Available outerwear:",
          outerwearCandidates.map((item) => ({
            name: item.name,
            category: item.category,
          }))
        );
      }

      const outerwear = this.selectCompatibleItems(
        outerwearCandidates,
        selectedItems,
        1
      );

      if (hasDress && outerwear.length > 0) {
        console.log(
          "Debug: Selected outerwear for dress outfit:",
          outerwear.map((item) => ({
            name: item.name,
            category: item.category,
          }))
        );
      }

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

    // Step 5: Validate outfit for conflicts before scoring
    const outfitValidation =
      OutfitCompatibilityEngine.validateOutfitCombination(
        selectedItems.map((item) => ({
          name: item.name,
          category: item.category,
          tags: item.tags,
        }))
      );

    // Reject outfits with conflicts
    if (!outfitValidation.isValid) {
      console.warn(
        "Generated outfit has conflicts:",
        outfitValidation.conflicts
      );
      return null;
    }

    // Step 6: Analyze and score the outfit
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

    // Logical compatibility analysis (NEW)
    const logicalCompatibility = this.calculateLogicalCompatibility(items);

    // Conflict analysis
    const validation = OutfitCompatibilityEngine.validateOutfitCombination(
      items.map((item) => ({
        name: item.name,
        category: item.category,
        tags: item.tags,
      }))
    );

    // Calculate overall score with updated weights
    const overallScore = Math.round(
      colorHarmony * SCORING_CONSTANTS.COLOR_HARMONY_WEIGHT +
        completeness * SCORING_CONSTANTS.COMPLETENESS_WEIGHT +
        styleCoherence * SCORING_CONSTANTS.STYLE_COHERENCE_WEIGHT +
        logicalCompatibility * SCORING_CONSTANTS.LOGICAL_COMPATIBILITY_WEIGHT
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
    const allColors: string[] = [];

    // Collect all colors from all items
    items.forEach((item) => {
      item.colors.forEach((color) => {
        allColors.push(color);
      });
    });

    if (allColors.length === 0) return [];

    // Group similar colors and find representative colors
    const colorGroups = this.groupSimilarColors(allColors);

    // Sort groups by size (most prominent colors first) and take max 3
    const dominantColors = colorGroups
      .sort((a, b) => b.colors.length - a.colors.length)
      .slice(0, 3)
      .map((group) => group.representative);

    return dominantColors;
  }

  // Group similar colors together and find a representative color for each group
  private static groupSimilarColors(
    colors: string[]
  ): Array<{ colors: string[]; representative: string }> {
    const groups: Array<{ colors: string[]; representative: string }> = [];
    const usedColors = new Set<string>();

    for (const color of colors) {
      if (usedColors.has(color)) continue;

      const group = { colors: [color], representative: color };
      usedColors.add(color);

      // Find similar colors to group together
      for (const otherColor of colors) {
        if (usedColors.has(otherColor) || color === otherColor) continue;

        if (this.areColorsSimilar(color, otherColor)) {
          group.colors.push(otherColor);
          usedColors.add(otherColor);
        }
      }

      // If we have multiple similar colors, calculate the average as representative
      if (group.colors.length > 1) {
        group.representative = this.calculateAverageColor(group.colors);
      }

      groups.push(group);
    }

    return groups;
  }

  // Check if two colors are similar enough to be grouped
  private static areColorsSimilar(color1: string, color2: string): boolean {
    // Convert hex to RGB for comparison
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return false;

    // Calculate color distance using Euclidean distance in RGB space
    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );

    // Colors are similar if distance is less than 50 (adjustable threshold)
    return distance < 50;
  }

  // Calculate average color from a group of similar colors
  private static calculateAverageColor(colors: string[]): string {
    const rgbColors = colors
      .map((color) => this.hexToRgb(color))
      .filter(
        (color): color is { r: number; g: number; b: number } => color !== null
      );

    if (rgbColors.length === 0) return colors[0];

    const avgR = Math.round(
      rgbColors.reduce((sum, color) => sum + color.r, 0) / rgbColors.length
    );
    const avgG = Math.round(
      rgbColors.reduce((sum, color) => sum + color.g, 0) / rgbColors.length
    );
    const avgB = Math.round(
      rgbColors.reduce((sum, color) => sum + color.b, 0) / rgbColors.length
    );

    return this.rgbToHex(avgR, avgG, avgB);
  }

  // Convert hex color to RGB
  private static hexToRgb(
    hex: string
  ): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  // Convert RGB to hex
  private static rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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
    // Get core items for each outfit (pants, tops, dresses - the main pieces)
    const getCoreItems = (outfit: Outfit) => {
      return outfit.items.filter((item) => {
        const category = OutfitCompatibilityEngine.categorizeItem(
          item.name,
          item.category,
          item.tags
        );
        return (
          category?.type === "bottom" ||
          category?.type === "base" ||
          category?.name === "dress" ||
          category?.name === "jumpsuit"
        );
      });
    };

    const coreItems1 = getCoreItems(outfit1);
    const coreItems2 = getCoreItems(outfit2);

    // Check if any core items are shared (strict rule for main pieces)
    const sharedCoreItems = coreItems1.filter((item1) =>
      coreItems2.some((item2) => item1.id === item2.id)
    );

    // If any core items are shared, outfits are too similar
    if (sharedCoreItems.length > 0) {
      return true;
    }

    // For non-core items (accessories, shoes), allow some overlap but not too much
    const nonCoreItems1 = outfit1.items.filter(
      (item) => !coreItems1.includes(item)
    );
    const nonCoreItems2 = outfit2.items.filter(
      (item) => !coreItems2.includes(item)
    );

    const sharedNonCoreItems = nonCoreItems1.filter((item1) =>
      nonCoreItems2.some((item2) => item1.id === item2.id)
    );

    // Allow up to 50% shared non-core items (accessories, shoes)
    const nonCoreSimilarity =
      sharedNonCoreItems.length /
      Math.max(nonCoreItems1.length, nonCoreItems2.length, 1);

    return nonCoreSimilarity > 0.5;
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

  // Helper method to determine if outfit should use a dress based on occasion
  private static shouldUseDress(occasion?: string): boolean {
    if (!occasion) return false;

    const formalOccasions = ["formal", "business", "party"];
    return formalOccasions.includes(occasion.toLowerCase());
  }

  // Helper method to determine if t-shirt should be standalone based on occasion and tags
  private static shouldTshirtBeStandalone(
    occasion?: string,
    items?: Item[]
  ): boolean {
    if (!occasion) return Math.random() < 0.5; // Random if no occasion specified

    const occasionLower = occasion.toLowerCase();
    const rules = OUTFIT_CONSTANTS.TSHIRT_LAYERING_RULES;

    // Check if occasion requires standalone t-shirt
    if (
      (rules.STANDALONE_OCCASIONS as readonly string[]).includes(occasionLower)
    ) {
      return Math.random() < rules.STANDALONE_CHANCE;
    }

    // Check if occasion requires layers
    if (
      (rules.LAYER_REQUIRED_OCCASIONS as readonly string[]).includes(
        occasionLower
      )
    ) {
      return false; // Always need layers for formal occasions
    }

    // For optional layer occasions, consider seasonal tags
    if (
      (rules.OPTIONAL_LAYER_OCCASIONS as readonly string[]).includes(
        occasionLower
      )
    ) {
      // Check if items have summer tags - if so, prefer standalone
      const hasSummerTags = items?.some((item) =>
        item.tags.some((tag) =>
          ["summer", "hot", "warm"].includes(tag.toLowerCase())
        )
      );
      return hasSummerTags || Math.random() < 0.4;
    }

    return Math.random() < 0.5; // Default random
  }

  // Calculate logical compatibility score for clothing combinations
  private static calculateLogicalCompatibility(items: Item[]): number {
    let score = 100;

    // Check for dress conflicts
    const hasDress = items.some(
      (item) =>
        item.category.toLowerCase().includes("dress") ||
        item.tags.some((tag) => tag.toLowerCase().includes("dress"))
    );

    if (hasDress) {
      // Dresses shouldn't be with separate tops or bottoms
      const hasTop = items.some((item) =>
        ["tshirts", "sweaters", "shirts"].includes(item.category.toLowerCase())
      );
      const hasBottom = items.some((item) =>
        ["pants", "shorts", "skirts"].includes(item.category.toLowerCase())
      );

      if (hasTop || hasBottom) {
        score -= 40; // Major penalty for dress + separates
      }
    }

    // Check for vest conflicts
    const hasVest = items.some(
      (item) =>
        item.category.toLowerCase().includes("vest") ||
        item.tags.some((tag) => tag.toLowerCase().includes("vest"))
    );

    if (hasVest) {
      const hasHoodie = items.some(
        (item) =>
          item.category.toLowerCase().includes("hoodie") ||
          item.tags.some((tag) => tag.toLowerCase().includes("hoodie"))
      );

      if (hasHoodie) {
        score -= 35; // Penalty for vest + hoodie
      }
    }

    return Math.max(0, score);
  }
}
