/**
 * Clothing Category System for Smart Outfit Generation
 * Prevents conflicts like wearing hoodie + vest or pants + skirt
 */

import { CATEGORY_TYPE_MAP } from "./constants";

export interface ClothingCategory {
  name: string;
  type: "base" | "layer" | "outer" | "bottom" | "shoes" | "accessory";
  subtype?: string;
  conflicts?: string[]; // Categories that conflict with this one
  maxPerOutfit: number;
  priority: number; // Higher priority items are preferred
}

export const CLOTHING_CATEGORIES: Record<string, ClothingCategory> = {
  // Tops - Base Layer
  "t-shirt": { name: "t-shirt", type: "base", maxPerOutfit: 1, priority: 5 },
  "tank-top": { name: "tank-top", type: "base", maxPerOutfit: 1, priority: 4 },
  blouse: { name: "blouse", type: "base", maxPerOutfit: 1, priority: 6 },
  shirt: { name: "shirt", type: "base", maxPerOutfit: 1, priority: 6 },
  "crop-top": { name: "crop-top", type: "base", maxPerOutfit: 1, priority: 4 },

  // Tops - Layer
  cardigan: { name: "cardigan", type: "layer", maxPerOutfit: 1, priority: 5 },
  sweater: {
    name: "sweater",
    type: "base",
    maxPerOutfit: 1,
    priority: 6,
    conflicts: ["hoodie", "sweatshirt"],
  },
  hoodie: {
    name: "hoodie",
    type: "layer",
    maxPerOutfit: 1,
    priority: 5,
    conflicts: ["vest", "blazer", "cardigan", "sweater"],
  },
  sweatshirt: {
    name: "sweatshirt",
    type: "base",
    maxPerOutfit: 1,
    priority: 5,
    conflicts: ["sweater"],
  },
  vest: {
    name: "vest",
    type: "layer",
    maxPerOutfit: 1,
    priority: 4,
    conflicts: ["hoodie", "jacket", "blazer"],
  },
  blazer: {
    name: "blazer",
    type: "layer",
    maxPerOutfit: 1,
    priority: 7,
    conflicts: ["hoodie", "vest"],
  },

  // Outerwear
  jacket: {
    name: "jacket",
    type: "outer",
    maxPerOutfit: 1,
    priority: 6,
    conflicts: ["coat", "vest"],
  },
  coat: {
    name: "coat",
    type: "outer",
    maxPerOutfit: 1,
    priority: 7,
    conflicts: ["jacket"],
  },
  "leather-jacket": {
    name: "leather-jacket",
    type: "outer",
    maxPerOutfit: 1,
    priority: 6,
    conflicts: ["coat", "vest"],
  },
  "denim-jacket": {
    name: "denim-jacket",
    type: "layer",
    maxPerOutfit: 1,
    priority: 5,
    conflicts: ["vest", "blazer"],
  },

  // Bottoms
  jeans: {
    name: "jeans",
    type: "bottom",
    maxPerOutfit: 1,
    priority: 6,
    conflicts: ["pants", "skirt", "shorts", "leggings"],
  },
  pants: {
    name: "pants",
    type: "bottom",
    maxPerOutfit: 1,
    priority: 6,
    conflicts: ["jeans", "skirt", "shorts", "leggings"],
  },
  skirt: {
    name: "skirt",
    type: "bottom",
    maxPerOutfit: 1,
    priority: 5,
    conflicts: ["jeans", "pants", "shorts", "leggings"],
  },
  shorts: {
    name: "shorts",
    type: "bottom",
    maxPerOutfit: 1,
    priority: 4,
    conflicts: ["jeans", "pants", "skirt", "leggings"],
  },
  leggings: {
    name: "leggings",
    type: "bottom",
    maxPerOutfit: 1,
    priority: 4,
    conflicts: ["jeans", "pants", "skirt", "shorts"],
  },

  // Dresses (special case - replaces tops and bottoms)
  dress: {
    name: "dress",
    type: "base",
    maxPerOutfit: 1,
    priority: 8,
    conflicts: [
      "jeans",
      "pants",
      "skirt",
      "shorts",
      "leggings",
      "t-shirt",
      "blouse",
      "shirt",
    ],
  },
  jumpsuit: {
    name: "jumpsuit",
    type: "base",
    maxPerOutfit: 1,
    priority: 7,
    conflicts: [
      "jeans",
      "pants",
      "skirt",
      "shorts",
      "leggings",
      "t-shirt",
      "blouse",
      "shirt",
    ],
  },

  // Shoes
  sneakers: { name: "sneakers", type: "shoes", maxPerOutfit: 1, priority: 5 },
  boots: { name: "boots", type: "shoes", maxPerOutfit: 1, priority: 6 },
  heels: { name: "heels", type: "shoes", maxPerOutfit: 1, priority: 6 },
  sandals: { name: "sandals", type: "shoes", maxPerOutfit: 1, priority: 4 },
  flats: { name: "flats", type: "shoes", maxPerOutfit: 1, priority: 5 },
  loafers: { name: "loafers", type: "shoes", maxPerOutfit: 1, priority: 6 },

  // Accessories
  necklace: {
    name: "necklace",
    type: "accessory",
    maxPerOutfit: 2,
    priority: 3,
  },
  earrings: {
    name: "earrings",
    type: "accessory",
    maxPerOutfit: 1,
    priority: 4,
  },
  bracelet: {
    name: "bracelet",
    type: "accessory",
    maxPerOutfit: 2,
    priority: 2,
  },
  ring: { name: "ring", type: "accessory", maxPerOutfit: 4, priority: 2 },
  watch: { name: "watch", type: "accessory", maxPerOutfit: 1, priority: 4 },
  belt: { name: "belt", type: "accessory", maxPerOutfit: 1, priority: 3 },
  scarf: { name: "scarf", type: "accessory", maxPerOutfit: 1, priority: 3 },
  hat: { name: "hat", type: "accessory", maxPerOutfit: 1, priority: 2 },
  bag: { name: "bag", type: "accessory", maxPerOutfit: 1, priority: 5 },
  purse: {
    name: "purse",
    type: "accessory",
    maxPerOutfit: 1,
    priority: 5,
    conflicts: ["bag"],
  },
};

export class OutfitCompatibilityEngine {
  // Determine category from item name/description
  static categorizeItem(
    name: string,
    category: string,
    tags: string[]
  ): ClothingCategory | null {
    const text = `${name} ${category} ${tags.join(" ")}`.toLowerCase();

    // First check if the category exactly matches our constants
    if (CATEGORY_TYPE_MAP[category]) {
      return CATEGORY_TYPE_MAP[category];
    }

    // Direct category matches (handle both singular and plural)
    for (const [key, categoryInfo] of Object.entries(CLOTHING_CATEGORIES)) {
      const keyVariants = [
        key,
        key.replace("-", " "),
        key + "s", // plural
        key.replace("-", " ") + "s", // plural with spaces
      ];

      if (
        keyVariants.some(
          (variant) =>
            text.includes(variant) || category.toLowerCase() === variant
        )
      ) {
        return categoryInfo;
      }
    }

    // Fallback to our constants mapping
    for (const [key, categoryInfo] of Object.entries(CATEGORY_TYPE_MAP)) {
      if (
        category.toLowerCase() === key ||
        category.toLowerCase().includes(key)
      ) {
        return categoryInfo;
      }
    }

    return null;
  }

  // Check if two items conflict with each other
  static itemsConflict(
    item1: ClothingCategory,
    item2: ClothingCategory
  ): boolean {
    // Check direct conflicts
    if (
      item1.conflicts?.includes(item2.name) ||
      item2.conflicts?.includes(item1.name)
    ) {
      return true;
    }

    // Check type-based conflicts
    if (item1.type === item2.type && item1.type !== "accessory") {
      // Same type items generally conflict (except accessories)
      return true;
    }

    return false;
  }

  // Validate if items can be worn together
  static validateOutfitCombination(
    items: Array<{ name: string; category: string; tags: string[] }>
  ): {
    isValid: boolean;
    conflicts: string[];
    suggestions: string[];
  } {
    const categorizedItems = items
      .map((item) => ({
        ...item,
        categoryInfo: this.categorizeItem(item.name, item.category, item.tags),
      }))
      .filter((item) => item.categoryInfo !== null);

    const conflicts: string[] = [];
    const suggestions: string[] = [];

    // Check for conflicts between items
    for (let i = 0; i < categorizedItems.length; i++) {
      for (let j = i + 1; j < categorizedItems.length; j++) {
        const item1 = categorizedItems[i];
        const item2 = categorizedItems[j];

        if (this.itemsConflict(item1.categoryInfo!, item2.categoryInfo!)) {
          conflicts.push(`${item1.name} conflicts with ${item2.name}`);
        }
      }
    }

    // Check for missing essential items
    const hasTop = categorizedItems.some(
      (item) =>
        item.categoryInfo!.type === "base" &&
        !item.categoryInfo!.name.includes("dress")
    );
    const hasBottom = categorizedItems.some(
      (item) =>
        item.categoryInfo!.type === "bottom" ||
        item.categoryInfo!.name.includes("dress")
    );
    const hasShoes = categorizedItems.some(
      (item) => item.categoryInfo!.type === "shoes"
    );

    if (
      !hasTop &&
      !categorizedItems.some((item) =>
        item.categoryInfo!.name.includes("dress")
      )
    ) {
      suggestions.push("Add a top (shirt, blouse, etc.)");
    }
    if (!hasBottom) {
      suggestions.push("Add bottoms (pants, skirt, etc.) or a dress");
    }
    if (!hasShoes) {
      suggestions.push("Add shoes");
    }

    // Check accessory limits
    const accessoryCount: Record<string, number> = {};
    categorizedItems.forEach((item) => {
      if (item.categoryInfo!.type === "accessory") {
        const categoryName = item.categoryInfo!.name;
        accessoryCount[categoryName] = (accessoryCount[categoryName] || 0) + 1;

        if (accessoryCount[categoryName] > item.categoryInfo!.maxPerOutfit) {
          conflicts.push(
            `Too many ${categoryName}s (max: ${
              item.categoryInfo!.maxPerOutfit
            })`
          );
        }
      }
    });

    return {
      isValid: conflicts.length === 0,
      conflicts,
      suggestions,
    };
  }

  // Filter items that would work with existing outfit
  static filterCompatibleItems(
    existingItems: Array<{ name: string; category: string; tags: string[] }>,
    candidateItems: Array<{ name: string; category: string; tags: string[] }>
  ): Array<{ name: string; category: string; tags: string[] }> {
    const existingCategorized = existingItems
      .map((item) => this.categorizeItem(item.name, item.category, item.tags))
      .filter((cat) => cat !== null) as ClothingCategory[];

    return candidateItems.filter((candidate) => {
      const candidateCategory = this.categorizeItem(
        candidate.name,
        candidate.category,
        candidate.tags
      );
      if (!candidateCategory) return true; // Unknown items are allowed

      // Check conflicts with existing items
      for (const existing of existingCategorized) {
        if (this.itemsConflict(existing, candidateCategory)) {
          return false;
        }
      }

      // Check if adding this item would exceed limits
      const sameTypeCount = existingCategorized.filter(
        (cat) => cat.name === candidateCategory.name
      ).length;

      if (sameTypeCount >= candidateCategory.maxPerOutfit) {
        return false;
      }

      return true;
    });
  }

  // Score outfit based on completeness and balance
  static scoreOutfitCompleteness(
    items: Array<{ name: string; category: string; tags: string[] }>
  ): number {
    const categorizedItems = items
      .map((item) => this.categorizeItem(item.name, item.category, item.tags))
      .filter((cat) => cat !== null) as ClothingCategory[];

    let score = 0;

    // Essential items scoring
    const hasTop = categorizedItems.some(
      (cat) => cat.type === "base" && !cat.name.includes("dress")
    );
    const hasBottom = categorizedItems.some(
      (cat) => cat.type === "bottom" || cat.name.includes("dress")
    );
    const hasShoes = categorizedItems.some((cat) => cat.type === "shoes");

    if (hasTop || categorizedItems.some((cat) => cat.name.includes("dress")))
      score += 30;
    if (hasBottom) score += 30;
    if (hasShoes) score += 25;

    // Layering bonus
    const hasLayer = categorizedItems.some((cat) => cat.type === "layer");
    if (hasLayer) score += 10;

    // Accessory bonus (but not too many)
    const accessoryCount = categorizedItems.filter(
      (cat) => cat.type === "accessory"
    ).length;
    if (accessoryCount >= 1 && accessoryCount <= 3) score += 5;

    return Math.min(100, score);
  }
}
