import { supabase } from "./supabase";
import { Item } from "./types";

export interface StatsData {
  totalItems: number;
  totalCategories: number;
  recentItemsCount: number;
  lastAddedDate: string | null;
}

export interface CategoryStats {
  category: string;
  count: number;
}

export interface TagStats {
  tag: string;
  count: number;
}

export class ItemsService {
  // Get overall stats for the homepage
  static async getStats(): Promise<StatsData> {
    try {
      // Get total items count
      const { count: totalItems, error: countError } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      // Get unique categories count
      const { data: categories, error: categoriesError } = await supabase
        .from("items")
        .select("category");

      if (categoriesError) throw categoriesError;

      const uniqueCategories = new Set(
        categories?.map((item) => item.category) || []
      );
      const totalCategories = uniqueCategories.size;

      // Get recent items (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentItemsCount, error: recentError } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      if (recentError) throw recentError;

      // Get last added item date
      const { data: lastItem, error: lastItemError } = await supabase
        .from("items")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      if (lastItemError) throw lastItemError;

      const lastAddedDate = lastItem?.[0]?.created_at || null;

      return {
        totalItems: totalItems || 0,
        totalCategories,
        recentItemsCount: recentItemsCount || 0,
        lastAddedDate,
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        totalItems: 0,
        totalCategories: 0,
        recentItemsCount: 0,
        lastAddedDate: null,
      };
    }
  }

  // Get recent items for homepage
  static async getRecentItems(limit = 4): Promise<Item[]> {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching recent items:", error);
      return [];
    }
  }

  // Get all items with filtering and sorting for browse page
  static async getItems(
    options: {
      category?: string;
      tags?: string[];
      colors?: string[];
      sortBy?: "created_at" | "name" | "category";
      sortOrder?: "asc" | "desc";
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ items: Item[]; totalCount: number }> {
    try {
      let query = supabase.from("items").select("*", { count: "exact" });

      // Apply filters
      if (options.category) {
        query = query.eq("category", options.category);
      }

      if (options.tags && options.tags.length > 0) {
        query = query.overlaps("tags", options.tags);
      }

      if (options.colors && options.colors.length > 0) {
        query = query.overlaps("colors", options.colors);
      }

      // Apply sorting
      const sortBy = options.sortBy || "created_at";
      const sortOrder = options.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        items: data || [],
        totalCount: count || 0,
      };
    } catch (error) {
      console.error("Error fetching items:", error);
      return { items: [], totalCount: 0 };
    }
  }

  // Get category statistics
  static async getCategoryStats(): Promise<CategoryStats[]> {
    try {
      const { data, error } = await supabase.from("items").select("category");

      if (error) throw error;

      const categoryCount: { [key: string]: number } = {};
      data?.forEach((item) => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });

      return Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count,
      }));
    } catch (error) {
      console.error("Error fetching category stats:", error);
      return [];
    }
  }

  // Get tag statistics
  static async getTagStats(): Promise<TagStats[]> {
    try {
      const { data, error } = await supabase.from("items").select("tags");

      if (error) throw error;

      const tagCount: { [key: string]: number } = {};
      data?.forEach((item) => {
        item.tags?.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });

      return Object.entries(tagCount)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Error fetching tag stats:", error);
      return [];
    }
  }

  // Get unique values for filters
  static async getFilterOptions(): Promise<{
    categories: string[];
    tags: string[];
    colors: string[];
  }> {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("category, tags, colors");

      if (error) throw error;

      const categories = new Set<string>();
      const tags = new Set<string>();
      const colors = new Set<string>();

      data?.forEach((item) => {
        categories.add(item.category);
        item.tags?.forEach((tag: string) => tags.add(tag));
        item.colors?.forEach((color: string) => colors.add(color));
      });

      return {
        categories: Array.from(categories).sort(),
        tags: Array.from(tags).sort(),
        colors: Array.from(colors).sort(),
      };
    } catch (error) {
      console.error("Error fetching filter options:", error);
      return { categories: [], tags: [], colors: [] };
    }
  }

  // Get random items for outfit generation
  static async getRandomItems(count = 10): Promise<Item[]> {
    try {
      // First get total count
      const { count: totalCount } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true });

      if (!totalCount || totalCount === 0) return [];

      // Generate random offset
      const randomOffset = Math.floor(
        Math.random() * Math.max(0, totalCount - count)
      );

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .range(randomOffset, randomOffset + count - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching random items:", error);
      return [];
    }
  }
}
