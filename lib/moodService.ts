import { ItemsService } from "./itemsService";
import { supabase } from "./supabase";
import { Item, Mood, MoodOutfit, MoodStats } from "./types";

export class MoodService {
  // Get all moods
  static async getMoods(): Promise<Mood[]> {
    try {
      const { data, error } = await supabase
        .from("moods")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching moods:", error);
      return [];
    }
  }

  // Get mood by ID
  static async getMoodById(id: string): Promise<Mood | null> {
    try {
      const { data, error } = await supabase
        .from("moods")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching mood:", error);
      return null;
    }
  }

  // Create a new mood
  static async createMood(
    mood: Omit<Mood, "id" | "created_at" | "updated_at">
  ): Promise<Mood | null> {
    try {
      const { data, error } = await supabase
        .from("moods")
        .insert([mood])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating mood:", error);
      return null;
    }
  }

  // Update mood
  static async updateMood(
    id: string,
    updates: Partial<Mood>
  ): Promise<Mood | null> {
    try {
      const { data, error } = await supabase
        .from("moods")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating mood:", error);
      return null;
    }
  }

  // Delete mood
  static async deleteMood(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("moods").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting mood:", error);
      return false;
    }
  }

  // Get mood statistics
  static async getMoodStats(): Promise<MoodStats> {
    try {
      // Get total moods count
      const { count: totalMoods, error: countError } = await supabase
        .from("moods")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      // Get all moods for analysis
      const { data: moods, error: moodsError } = await supabase
        .from("moods")
        .select("vibe, colors, created_at");

      if (moodsError) throw moodsError;

      // Calculate favorite vibe
      const vibeCount: Record<string, number> = {};
      const colorCount: Record<string, number> = {};

      moods?.forEach((mood) => {
        vibeCount[mood.vibe] = (vibeCount[mood.vibe] || 0) + 1;

        mood.colors.forEach((color: string) => {
          colorCount[color] = (colorCount[color] || 0) + 1;
        });
      });

      const favoriteVibe =
        Object.entries(vibeCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "casual";

      const mostUsedColors = Object.entries(colorCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([color]) => color);

      // Get recent moods (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentMoods, error: recentError } = await supabase
        .from("moods")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      if (recentError) throw recentError;

      return {
        totalMoods: totalMoods || 0,
        favoriteVibe,
        mostUsedColors,
        recentMoods: recentMoods || 0,
      };
    } catch (error) {
      console.error("Error fetching mood stats:", error);
      return {
        totalMoods: 0,
        favoriteVibe: "casual",
        mostUsedColors: [],
        recentMoods: 0,
      };
    }
  }

  // Generate outfit suggestions based on a mood
  static async generateMoodOutfit(moodId: string): Promise<Item[]> {
    try {
      const mood = await this.getMoodById(moodId);
      if (!mood) return [];

      // Get all items
      const allItemsResult = await ItemsService.getItems();
      const allItems = allItemsResult.items;

      // Score items based on mood compatibility
      const scoredItems = allItems.map((item: Item) => {
        let score = 0;

        // Color compatibility (40% of score)
        const colorMatch = item.colors.some((itemColor: string) =>
          mood.colors.some((moodColor: string) =>
            this.colorsAreCompatible(itemColor, moodColor)
          )
        );
        if (colorMatch) score += 40;

        // Tag compatibility (30% of score)
        const tagMatch = item.tags.some((tag: string) =>
          mood.tags.includes(tag)
        );
        if (tagMatch) score += 30;

        // Vibe compatibility (30% of score)
        const vibeCompatible = this.isVibeCompatible(item, mood.vibe);
        if (vibeCompatible) score += 30;

        return { item, score };
      });

      // Sort by score and select top items
      scoredItems.sort(
        (a: { item: Item; score: number }, b: { item: Item; score: number }) =>
          b.score - a.score
      );

      // Try to get a balanced outfit (top, bottom, shoes, accessories)
      const outfit: Item[] = [];
      const categories = [
        "tops",
        "bottoms",
        "shoes",
        "accessories",
        "outerwear",
      ];

      for (const category of categories) {
        const categoryItem = scoredItems.find(
          ({ item }: { item: Item; score: number }) =>
            item.category.toLowerCase().includes(category.slice(0, -1)) &&
            !outfit.includes(item)
        );

        if (categoryItem && outfit.length < 5) {
          outfit.push(categoryItem.item);
        }
      }

      // If we need more items, add highest scoring remaining items
      const remainingItems = scoredItems
        .filter(
          ({ item }: { item: Item; score: number }) => !outfit.includes(item)
        )
        .slice(0, 5 - outfit.length);

      outfit.push(
        ...remainingItems.map(({ item }: { item: Item; score: number }) => item)
      );

      return outfit;
    } catch (error) {
      console.error("Error generating mood outfit:", error);
      return [];
    }
  }

  // Check if two colors are compatible
  private static colorsAreCompatible(color1: string, color2: string): boolean {
    // Simple color compatibility check
    // In a real app, you might use more sophisticated color theory

    const complementaryPairs = [
      ["red", "green"],
      ["blue", "orange"],
      ["yellow", "purple"],
      ["pink", "mint"],
      ["navy", "cream"],
      ["black", "white"],
    ];

    const analogousPairs = [
      ["red", "orange"],
      ["orange", "yellow"],
      ["yellow", "green"],
      ["green", "blue"],
      ["blue", "purple"],
      ["purple", "pink"],
    ];

    const neutral = ["black", "white", "gray", "beige", "cream", "brown"];

    // Neutrals go with everything
    if (
      neutral.includes(color1.toLowerCase()) ||
      neutral.includes(color2.toLowerCase())
    ) {
      return true;
    }

    // Check complementary colors
    const isComplementary = complementaryPairs.some(
      (pair) =>
        pair.includes(color1.toLowerCase()) &&
        pair.includes(color2.toLowerCase())
    );

    // Check analogous colors
    const isAnalogous = analogousPairs.some(
      (pair) =>
        pair.includes(color1.toLowerCase()) &&
        pair.includes(color2.toLowerCase())
    );

    return (
      isComplementary ||
      isAnalogous ||
      color1.toLowerCase() === color2.toLowerCase()
    );
  }

  // Check if item is compatible with a vibe
  private static isVibeCompatible(item: Item, vibe: string): boolean {
    const vibeKeywords: Record<string, string[]> = {
      casual: ["casual", "comfort", "everyday", "relaxed"],
      formal: ["formal", "business", "professional", "dress", "suit"],
      cozy: ["cozy", "warm", "soft", "comfort", "knit"],
      edgy: ["edgy", "rock", "leather", "bold", "statement"],
      romantic: ["romantic", "feminine", "floral", "lace", "soft"],
      professional: ["professional", "business", "office", "formal"],
      sporty: ["sporty", "athletic", "active", "gym", "workout"],
      bohemian: ["bohemian", "boho", "flowy", "earthy", "artistic"],
    };

    const keywords = vibeKeywords[vibe] || [];

    return keywords.some(
      (keyword) =>
        item.name.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.tags.some((tag) => tag.toLowerCase().includes(keyword))
    );
  }

  // Save a mood outfit combination
  static async saveMoodOutfit(
    moodId: string,
    itemIds: string[]
  ): Promise<MoodOutfit | null> {
    try {
      const compatibilityScore = Math.random() * 100; // Placeholder - calculate real score

      const { data, error } = await supabase
        .from("mood_outfits")
        .insert([
          {
            mood_id: moodId,
            outfit_items: itemIds,
            compatibility_score: compatibilityScore,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving mood outfit:", error);
      return null;
    }
  }

  // Get saved outfits for a mood
  static async getMoodOutfits(moodId: string): Promise<MoodOutfit[]> {
    try {
      const { data, error } = await supabase
        .from("mood_outfits")
        .select("*")
        .eq("mood_id", moodId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching mood outfits:", error);
      return [];
    }
  }
}
