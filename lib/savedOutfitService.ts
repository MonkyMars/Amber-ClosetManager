import { supabase } from "./supabase";
import { Outfit } from "./outfitService";

export interface SavedOutfit {
  id: string;
  item_ids: string[]; // Array of item IDs (actual column name)
  name?: string; // Outfit name
  description?: string; // Outfit description
  occasion?: string; // Occasion type
  compatibility_score?: number; // Outfit compatibility score
  is_favorite?: boolean; // Favorite status
  worn_count?: number; // Number of times worn
  last_worn_at?: string; // Last worn date
  notes?: string; // User notes
  rating?: number; // User rating 1-5
  tags?: string[]; // Tags array
  created_at: string;
  updated_at: string;
}

export class SavedOutfitService {
  // Save an outfit to the user's closet
  static async saveOutfit(
    outfit: Outfit,
    notes?: string,
    name?: string
  ): Promise<SavedOutfit | null> {
    try {
      const { data, error } = await supabase
        .from("outfits") // Use existing table
        .insert([
          {
            item_ids: outfit.items.map((item) => item.id),
            notes: notes || null,
            name: name || `${outfit.vibe} Outfit`,
            description: `Generated outfit with ${outfit.items.length} items`,
            occasion: outfit.vibe,
            compatibility_score: outfit.score,
            is_favorite: false,
            worn_count: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving outfit:", error);
      return null;
    }
  }

  // Get all saved outfits
  static async getSavedOutfits(): Promise<SavedOutfit[]> {
    try {
      const { data, error } = await supabase
        .from("outfits") // Use existing table
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching saved outfits:", error);
      return [];
    }
  }

  // Delete a saved outfit
  static async deleteSavedOutfit(outfitId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("outfits") // Use existing table
        .delete()
        .eq("id", outfitId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting saved outfit:", error);
      return false;
    }
  }

  // Update outfit rating, notes, or other properties
  static async updateSavedOutfit(
    outfitId: string,
    updates: {
      rating?: number;
      notes?: string;
      is_favorite?: boolean;
      worn_count?: number;
      last_worn_at?: string;
      name?: string;
    }
  ): Promise<SavedOutfit | null> {
    try {
      const { data, error } = await supabase
        .from("outfits") // Use existing table
        .update(updates)
        .eq("id", outfitId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating saved outfit:", error);
      return null;
    }
  }

  // Mark outfit as worn (increment worn_count and update last_worn_at)
  static async markAsWorn(outfitId: string): Promise<boolean> {
    try {
      const { data: outfit, error: fetchError } = await supabase
        .from("outfits")
        .select("worn_count")
        .eq("id", outfitId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("outfits")
        .update({
          worn_count: (outfit.worn_count || 0) + 1,
          last_worn_at: new Date().toISOString(),
        })
        .eq("id", outfitId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking outfit as worn:", error);
      return false;
    }
  }

  // Toggle favorite status
  static async toggleFavorite(outfitId: string): Promise<boolean> {
    try {
      const { data: outfit, error: fetchError } = await supabase
        .from("outfits")
        .select("is_favorite")
        .eq("id", outfitId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("outfits")
        .update({ is_favorite: !outfit.is_favorite })
        .eq("id", outfitId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return false;
    }
  }
}
