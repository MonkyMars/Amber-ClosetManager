/**
 * Application Constants
 * This file contains all the constants used throughout the application
 * to ensure consistency and prevent mismatches.
 */

// Item Categories - These are the definitive categories available in the app
export const ITEM_CATEGORIES = [
  { value: "shorts", label: "Shorts" },
  { value: "pants", label: "Long Pants" },
  { value: "skirts", label: "Skirts" },
  { value: "tshirts", label: "T-Shirts" },
  { value: "sweaters", label: "Sweaters" },
  { value: "hoodies", label: "Hoodies" },
  { value: "vests", label: "Vests" },
  { value: "dresses", label: "Dresses" },
  { value: "shoes", label: "Shoes" },
  { value: "socks", label: "Socks" },
  { value: "bracelets", label: "Bracelets" },
  { value: "rings", label: "Rings" },
  { value: "necklaces", label: "Necklaces" },
];

// Style Tags - Available style tags for items
export const STYLE_TAGS = [
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
export const OCCASIONS = [
  { value: "", label: "Any Occasion" },
  { value: "casual", label: "Casual Day Out" },
  { value: "formal", label: "Formal Event" },
  { value: "business", label: "Business Meeting" },
  { value: "party", label: "Party Night" },
  { value: "summer", label: "Summer Vibes" },
  { value: "winter", label: "Winter Cozy" },
];

// Category type mappings for outfit generation
export const CATEGORY_TYPE_MAP: Record<
  string,
  {
    type: "base" | "layer" | "outer" | "bottom" | "shoes" | "accessory";
    name: string;
    maxPerOutfit: number;
    priority: number;
    conflicts?: string[];
  }
> = {
  // Tops
  tshirts: { type: "base", name: "t-shirt", maxPerOutfit: 1, priority: 5 },
  sweaters: {
    type: "base",
    name: "sweater",
    maxPerOutfit: 1,
    priority: 6,
    conflicts: ["hoodies"],
  },
  hoodies: {
    type: "layer",
    name: "hoodie",
    maxPerOutfit: 1,
    priority: 5,
    conflicts: ["vests", "sweaters"],
  },
  vests: {
    type: "layer",
    name: "vest",
    maxPerOutfit: 1,
    priority: 4,
    conflicts: ["hoodies"],
  },

  // Bottoms
  shorts: {
    type: "bottom",
    name: "shorts",
    maxPerOutfit: 1,
    priority: 4,
    conflicts: ["pants", "skirts"],
  },
  pants: {
    type: "bottom",
    name: "pants",
    maxPerOutfit: 1,
    priority: 6,
    conflicts: ["shorts", "skirts"],
  },
  skirts: {
    type: "bottom",
    name: "skirt",
    maxPerOutfit: 1,
    priority: 5,
    conflicts: ["shorts", "pants"],
  },

  // Dresses (replace both top and bottom)
  dresses: {
    type: "base",
    name: "dress",
    maxPerOutfit: 1,
    priority: 8,
    conflicts: ["shorts", "pants", "skirts", "tshirts", "sweaters"],
  },

  // Footwear
  shoes: { type: "shoes", name: "shoes", maxPerOutfit: 1, priority: 5 },
  socks: { type: "accessory", name: "socks", maxPerOutfit: 1, priority: 2 },

  // Accessories
  bracelets: {
    type: "accessory",
    name: "bracelet",
    maxPerOutfit: 2,
    priority: 2,
  },
  rings: { type: "accessory", name: "ring", maxPerOutfit: 4, priority: 2 },
  necklaces: {
    type: "accessory",
    name: "necklace",
    maxPerOutfit: 2,
    priority: 3,
  },
};

// Category groups for easy filtering
export const CATEGORY_GROUPS = {
  TOPS: ["tshirts", "sweaters", "hoodies", "vests"],
  BOTTOMS: ["shorts", "pants", "skirts"],
  DRESSES: ["dresses"],
  FOOTWEAR: ["shoes", "socks"],
  ACCESSORIES: ["bracelets", "rings", "necklaces"],
} as const;

// Color system constants
export const COLOR_CONSTANTS = {
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
  MIN_OUTFIT_SCORE: 60,
  MAX_GENERATION_ATTEMPTS: 100,
  DEFAULT_OUTFIT_COUNT: 5,
  OUTERWEAR_CHANCE: 0.4, // 40% chance to add outerwear
  DRESS_FOUNDATION_CHANCE: 0.3, // 30% chance to build around dress
  ACCESSORY_RANGE: { min: 1, max: 3 },
} as const;

// Score thresholds and weights
export const SCORING_CONSTANTS = {
  COLOR_HARMONY_WEIGHT: 0.35,
  COMPLETENESS_WEIGHT: 0.35,
  STYLE_COHERENCE_WEIGHT: 0.3,
  COLOR_COMPATIBILITY_WEIGHT: 0.6,
  TAG_COMPATIBILITY_WEIGHT: 0.4,
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
