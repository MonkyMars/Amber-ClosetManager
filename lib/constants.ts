/**
 * Application Constants
 * This file contains all the constants used throughout the application
 * to ensure consistency and prevent mismatches.
 */

import { Category } from "./types";

// Item Categories - These are the definitive categories available in the app
export const ITEM_CATEGORIES: {
  value: string;
  label: string;
}[] = [
  { value: "shorts", label: "Shorts" },
  { value: "pants", label: "Long Pants" },
  { value: "skirts", label: "Skirts" },
  { value: "tshirts", label: "T-Shirts" },
  { value: "tops", label: "Tops" }, // Tank tops, crop tops, blouses, etc.
  { value: "sweaters", label: "Sweaters" },
  { value: "hoodies", label: "Hoodies" },
  { value: "jackets", label: "Jackets" },
  { value: "coats", label: "Coats" },
  { value: "vests", label: "Vests" },
  { value: "dresses", label: "Dresses" },
  { value: "sneakers", label: "Sneakers" },
  { value: "boots", label: "Boots" },
  { value: "heels", label: "Heels" },
  { value: "sandals", label: "Sandals" },
  { value: "flats", label: "Flats" },
  { value: "loafers", label: "Loafers" },
  { value: "socks", label: "Socks" },
  { value: "bracelets", label: "Bracelets" },
  { value: "rings", label: "Rings" },
  { value: "necklaces", label: "Necklaces" },
];

// Style Tags - Available style tags for items
export const STYLE_TAGS: {
  value: string;
  label: string;
}[] = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "business", label: "Business" },
  { value: "party", label: "Party" },
  { value: "summer", label: "Summer" },
  { value: "winter", label: "Winter" },
  { value: "spring", label: "Spring" },
  { value: "fall", label: "Fall" },
  { value: "vintage", label: "Vintage" },
  { value: "trendy", label: "Trendy" },
  { value: "comfortable", label: "Comfortable" },
  { value: "elegant", label: "Elegant" },
  { value: "sporty", label: "Sporty" },
  { value: "bohemian", label: "Bohemian" },
  { value: "minimalist", label: "Minimalist" },
];

// Occasion options for outfit generation
export const OCCASIONS: {
  value: string;
  label: string;
}[] = [
  { value: "", label: "Any Occasion" },
  { value: "casual", label: "Casual Day Out" },
  { value: "formal", label: "Formal Event" },
  { value: "business", label: "Business Meeting" },
  { value: "party", label: "Party Night" },
  { value: "summer", label: "Summer Vibes" },
  { value: "winter", label: "Winter Cozy" },
];

// Category type mappings for outfit generation
export const CATEGORY_TYPE_MAP: Record<string, Category> = {
  // Tops - Base Layer (only one base top allowed)
  tshirts: {
    type: "base",
    name: "t-shirt",
    maxPerOutfit: 1,
    priority: 5,
    conflicts: ["sweaters", "tops", "dresses"], // Can't wear with other base tops or dresses
  },
  tops: {
    type: "base",
    name: "tops",
    maxPerOutfit: 1,
    priority: 5,
    conflicts: [
      "tshirts",
      "sweaters",
      "hoodies",
      "vests",
      "jackets",
      "dresses",
    ], // Can only wear with coats (outer layer)
  },
  sweaters: {
    type: "base",
    name: "sweater",
    maxPerOutfit: 1,
    priority: 6,
    conflicts: ["tshirts", "tops", "hoodies", "dresses"], // Can't wear with other base tops, hoodies, or dresses
  },

  // Tops - Layer (can layer over base, but only one layer type)
  hoodies: {
    type: "layer",
    name: "hoodie",
    maxPerOutfit: 1,
    priority: 5,
    conflicts: ["sweaters", "tops", "vests", "jackets", "dresses"], // Can't wear with sweaters, tops, other layers, or dresses
    requires: ["tshirts"], // Should have a base layer underneath
  },
  vests: {
    type: "layer",
    name: "vest",
    maxPerOutfit: 1,
    priority: 4,
    requires: ["tshirts"], // Should have a base layer underneath
    conflicts: ["hoodies", "tops", "jackets", "dresses"], // Can't wear with tops, other layers, or dresses
  },

  // Tops - Outer Layer (can go over everything, but only one outer)
  jackets: {
    type: "outer",
    name: "jacket",
    maxPerOutfit: 1,
    priority: 6,
    conflicts: ["hoodies", "vests", "tops", "dresses"], // Can't wear with layers that would be bulky underneath, tops, or dresses
  },
  coats: {
    type: "outer",
    name: "coat",
    maxPerOutfit: 1,
    priority: 7,
    conflicts: ["hoodies", "vests", "jackets", "dresses"], // Can't wear with layers or other outerwear except can work with tops
  },

  // Bottoms (only one bottom type allowed, all conflict with each other)
  shorts: {
    type: "bottom",
    name: "shorts",
    maxPerOutfit: 1,
    priority: 4,
    conflicts: ["pants", "skirts", "dresses"], // Can't wear multiple bottoms or with dresses
  },
  pants: {
    type: "bottom",
    name: "pants",
    maxPerOutfit: 1,
    priority: 6,
    conflicts: ["shorts", "skirts", "dresses"], // Can't wear multiple bottoms or with dresses
  },
  skirts: {
    type: "bottom",
    name: "skirt",
    maxPerOutfit: 1,
    priority: 5,
    conflicts: ["shorts", "pants", "dresses"], // Can't wear multiple bottoms or with dresses
  },

  // Dresses (replaces both tops and bottoms - conflicts with everything except accessories, shoes, and outer layers)
  dresses: {
    type: "dress",
    name: "dress",
    maxPerOutfit: 1,
    priority: 8,
    conflicts: [
      "shorts",
      "pants",
      "skirts", // No bottoms with dresses
      "tshirts",
      "sweaters",
      "hoodies",
      "vests", // No tops or layers under dresses (except coats for layering)
      "tops",
    ],
  },

  // Footwear (required, only one pair of shoes)
  sneakers: {
    type: "shoes",
    name: "sneakers",
    maxPerOutfit: 1,
    priority: 5,
    requires: ["socks"], // Should have socks with shoes
    conflicts: ["boots", "heels", "sandals", "flats", "loafers"], // Only one type of shoe
  },
  boots: {
    type: "shoes",
    name: "boots",
    maxPerOutfit: 1,
    priority: 6,
    requires: ["socks"], // Should have socks with shoes
    conflicts: ["sneakers", "heels", "sandals", "flats", "loafers"], // Only one type of shoe
  },
  heels: {
    type: "shoes",
    name: "heels",
    maxPerOutfit: 1,
    priority: 6,
    requires: ["socks"], // Should have socks with shoes
    conflicts: ["sneakers", "boots", "sandals", "flats", "loafers"], // Only one type of shoe
  },
  sandals: {
    type: "shoes",
    name: "sandals",
    maxPerOutfit: 1,
    priority: 4,
    conflicts: ["sneakers", "boots", "heels", "flats", "loafers"], // Only one type of shoe, no socks needed
  },
  flats: {
    type: "shoes",
    name: "flats",
    maxPerOutfit: 1,
    priority: 5,
    requires: ["socks"], // Should have socks with shoes
    conflicts: ["sneakers", "boots", "heels", "sandals", "loafers"], // Only one type of shoe
  },
  loafers: {
    type: "shoes",
    name: "loafers",
    maxPerOutfit: 1,
    priority: 6,
    requires: ["socks"], // Should have socks with shoes
    conflicts: ["sneakers", "boots", "heels", "sandals", "flats"], // Only one type of shoe
  },
  socks: {
    type: "accessory",
    name: "socks",
    maxPerOutfit: 1,
    priority: 2,
    conflicts: [], // Socks go with everything
  },

  // Accessories (multiple allowed, no major conflicts)
  bracelets: {
    type: "accessory",
    name: "bracelet",
    maxPerOutfit: 2,
    priority: 2,
    conflicts: [], // Accessories generally don't conflict
  },
  rings: {
    type: "accessory",
    name: "ring",
    maxPerOutfit: 4,
    priority: 2,
    conflicts: [], // Accessories generally don't conflict
  },
  necklaces: {
    type: "accessory",
    name: "necklace",
    maxPerOutfit: 2,
    priority: 3,
    conflicts: [], // Accessories generally don't conflict
  },
};

// Category groups for easy filtering
export const CATEGORY_GROUPS: {
  [key: string]: string[];
} = {
  TOPS: ["tshirts", "tops", "sweaters", "hoodies", "jackets", "coats", "vests"],
  BOTTOMS: ["shorts", "pants", "skirts"],
  DRESSES: ["dresses"],
  FOOTWEAR: [
    "sneakers",
    "boots",
    "heels",
    "sandals",
    "flats",
    "loafers",
    "socks",
  ],
  ACCESSORIES: ["bracelets", "rings", "necklaces"],
} as const;

// Color system constants
export const COLOR_CONSTANTS: {
  MAX_COLORS_PER_ITEM: number;
  MIN_COLORS_PER_ITEM: number;
  PRESET_COLORS: string[];
} = {
  MAX_COLORS_PER_ITEM: 3,
  MIN_COLORS_PER_ITEM: 1,
  PRESET_COLORS: [
    "#000000", // Black
    "#FFFFFF", // White
    "#808080", // Gray
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
    "#FFC0CB", // Pink
    "#A52A2A", // Brown
    "#F5F5DC", // Beige
    "#000080", // Navy
    "#800000", // Maroon
  ],
} as const;

// Outfit generation constants
export const OUTFIT_CONSTANTS = {
  MIN_ITEMS_FOR_GENERATION: 3,
  MIN_OUTFIT_SCORE: 50, // Lowered to allow more variety
  MAX_GENERATION_ATTEMPTS: 100,
  DEFAULT_OUTFIT_COUNT: 5,
  OUTERWEAR_CHANCE: 0.4, // 40% chance to add outerwear
  DRESS_FOUNDATION_CHANCE: 0.3, // 30% chance to build around dress
  ACCESSORY_RANGE: { min: 1, max: 3 },

  // T-shirt layering logic based on occasion and season
  TSHIRT_LAYERING_RULES: {
    STANDALONE_OCCASIONS: ["casual", "summer", "party"], // T-shirt can be standalone
    LAYER_REQUIRED_OCCASIONS: ["formal", "business", "winter"], // T-shirt needs layers
    OPTIONAL_LAYER_OCCASIONS: ["spring", "fall"], // T-shirt may or may not need layers
    STANDALONE_CHANCE: 0.6, // 60% chance to keep t-shirt standalone for casual occasions
  },

  // Occasion-based outfit logic
  OCCASION_RULES: {
    FORMAL: {
      REQUIRED_LAYERS: true,
      MIN_PIECES: 3,
      AVOID_CATEGORIES: ["shorts", "hoodies"],
      PREFER_CATEGORIES: ["dresses", "pants", "jackets"],
    },
    BUSINESS: {
      REQUIRED_LAYERS: true,
      MIN_PIECES: 3,
      AVOID_CATEGORIES: ["shorts", "tshirts"],
      PREFER_CATEGORIES: ["sweaters", "pants", "jackets"],
    },
    CASUAL: {
      REQUIRED_LAYERS: false,
      MIN_PIECES: 2,
      FLEXIBLE: true,
    },
    SUMMER: {
      REQUIRED_LAYERS: false,
      MIN_PIECES: 2,
      AVOID_CATEGORIES: ["hoodies", "jackets"],
      PREFER_CATEGORIES: ["tshirts", "shorts", "dresses"],
    },
    WINTER: {
      REQUIRED_LAYERS: true,
      MIN_PIECES: 3,
      PREFER_CATEGORIES: ["sweaters", "hoodies", "jackets", "pants"],
    },
  },

  // Outfit composition rules
  REQUIRED_COMPONENTS: {
    // Either dress OR (top + bottom) + shoes
    DRESS_OUTFIT: ["dresses", "shoes"],
    STANDARD_OUTFIT: {
      REQUIRED: ["shoes"], // Always need shoes
      ONE_OF_TOPS: ["tshirts", "sweaters"], // Need at least one base top
      ONE_OF_BOTTOMS: ["shorts", "pants", "skirts"], // Need at least one bottom
    },
  },

  // Layering rules (what can go together)
  LAYERING_RULES: {
    BASE_LAYER: ["tshirts"], // Foundation layer
    OVER_BASE: ["hoodies", "vests"], // Can go over base layer
    OVER_LAYER: ["jackets"], // Can go over layer
    WITH_DRESS: ["jackets"], // Only jackets can be worn over dresses
    CONFLICTS: {
      // These combinations should never happen
      dresses: ["tshirts", "sweaters", "pants", "shorts", "skirts"], // Dress replaces top+bottom
      vests: ["hoodies", "jackets"], // Vests conflict with other layers
      hoodies: ["vests", "sweaters"], // Hoodies are a primary layer
    },
  },
} as const;

// Score thresholds and weights
export const SCORING_CONSTANTS = {
  COLOR_HARMONY_WEIGHT: 0.25, // Reduced from 0.35
  COMPLETENESS_WEIGHT: 0.35, // Clothing logic gets more weight
  STYLE_COHERENCE_WEIGHT: 0.25, // Style matching
  LOGICAL_COMPATIBILITY_WEIGHT: 0.15, // New: logical clothing combinations
  COLOR_COMPATIBILITY_WEIGHT: 0.4, // Reduced from 0.6
  TAG_COMPATIBILITY_WEIGHT: 0.4,
  LAYERING_LOGIC_WEIGHT: 0.2, // New: proper layering logic
  EXCELLENT_SCORE_THRESHOLD: 80,
  GOOD_SCORE_THRESHOLD: 60,
  OKAY_SCORE_THRESHOLD: 40,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MAX_TAGS_DISPLAY: 2,
  MAX_COLORS_DISPLAY: 3,
  MAX_STYLE_TAGS_DISPLAY: 6,
  LOADING_DELAY_MS: 500,
  SUCCESS_REDIRECT_DELAY_MS: 1500,
} as const;

// Type helpers for better TypeScript support
export type ItemCategory = (typeof ITEM_CATEGORIES)[number]["value"];
export type StyleTag = (typeof STYLE_TAGS)[number]["value"];
export type Occasion = (typeof OCCASIONS)[number]["value"];
export type CategoryGroup = keyof typeof CATEGORY_GROUPS;
export type ClothingType =
  | "base"
  | "layer"
  | "outer"
  | "bottom"
  | "shoes"
  | "accessory"
  | "dress";

// Helper functions for outfit validation
export const OUTFIT_VALIDATION = {
  /**
   * Check if two categories conflict with each other
   */
  hasConflict: (category1: ItemCategory, category2: ItemCategory): boolean => {
    const config1 = CATEGORY_TYPE_MAP[category1];
    const config2 = CATEGORY_TYPE_MAP[category2];

    return (
      config1?.conflicts?.includes(category2) ||
      config2?.conflicts?.includes(category1) ||
      false
    );
  },

  /**
   * Check if an outfit composition is valid
   */
  isValidOutfit: (categories: ItemCategory[]): boolean => {
    // Check for conflicts
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        if (OUTFIT_VALIDATION.hasConflict(categories[i], categories[j])) {
          return false;
        }
      }
    }

    // Check minimum requirements
    const hasDress = categories.includes("dresses");
    const hasShoes = categories.includes("shoes");

    if (hasDress) {
      // Dress outfit: just needs shoes
      return hasShoes;
    } else {
      // Standard outfit: needs top + bottom + shoes
      const hasTop = categories.some((cat) =>
        ["tshirts", "sweaters", "hoodies", "vests"].includes(cat)
      );
      const hasBottom = categories.some((cat) =>
        ["shorts", "pants", "skirts"].includes(cat)
      );

      return hasTop && hasBottom && hasShoes;
    }
  },

  /**
   * Get recommended additions for an incomplete outfit
   */
  getRecommendedAdditions: (categories: ItemCategory[]): ItemCategory[] => {
    const recommendations: ItemCategory[] = [];

    const hasDress = categories.includes("dresses");
    const hasShoes = categories.includes("shoes");

    if (hasDress) {
      if (!hasShoes) recommendations.push("shoes");
    } else {
      const hasBaseTop = categories.some((cat) =>
        ["tshirts", "sweaters"].includes(cat)
      );
      const hasBottom = categories.some((cat) =>
        ["shorts", "pants", "skirts"].includes(cat)
      );

      if (!hasBaseTop) recommendations.push("tshirts");
      if (!hasBottom) recommendations.push("pants");
      if (!hasShoes) recommendations.push("shoes");
    }

    return recommendations;
  },
} as const;
