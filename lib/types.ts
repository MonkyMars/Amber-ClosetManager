export interface RecentItem {
  id: string;
  name: string;
  category: string;
  color: string;
  addedDate: string;
  imageUrl?: string;
}

export interface Item {
  id?: string;
  name: string;
  category: string;
  description: string;
  colors: string[];
  tags: string[];
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FormData {
  name: string;
  category: string;
  description: string;
  colors: string[];
  tags: string[];
  image_url?: string;
}

export interface Mood {
  id?: string;
  title: string;
  description: string;
  colors: string[];
  tags: string[];
  vibe:
    | "casual"
    | "formal"
    | "cozy"
    | "edgy"
    | "romantic"
    | "professional"
    | "sporty"
    | "bohemian";
  emoji: string;
  created_at?: string;
  updated_at?: string;
}

export interface MoodOutfit {
  id: string;
  mood_id: string;
  outfit_items: string[]; // Array of item IDs
  compatibility_score: number;
  created_at: string;
}

export interface MoodStats {
  totalMoods: number;
  favoriteVibe: string;
  mostUsedColors: string[];
  recentMoods: number;
}

export type CategoryType =
  | "base"
  | "layer"
  | "outer"
  | "bottom"
  | "shoes"
  | "accessory"
  | "dress";

export interface Category {
  type: CategoryType;
  name: string;
  maxPerOutfit: number;
  priority: number;
  conflicts?: string[];
  requires?: string[];
}
