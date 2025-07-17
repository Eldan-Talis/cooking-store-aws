import React, { useEffect, useState } from "react";
import { getRecipes } from "../API/getRecipes";
import { getCategories } from "../API/getCategories";
import { getFavorites, addFavorite } from "../API/favorites";
import { Recipe } from "../API/types";
import { RecipeCard } from "../components/RecipeCard";
import CategorySelectMUI from "../components/CategorySlide";

import {
  Box,
  Button,
  Typography,
} from "@mui/material";

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [lastKey, setLastKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const loadMore = async () => {
  if (loading || !hasMore) return;
  setLoading(true);

  try {
    const data = await getRecipes(lastKey ?? undefined);
    setRecipes((prev) => [...prev, ...data.items]);
    setLastKey(data.lastKey ?? null);
    setHasMore(Boolean(data.lastKey));
  } catch (err: any) {
    setError(err.message || "Failed to load recipes.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadMore();
  }, []);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message || "Failed to load categories."));
  }, []);

  useEffect(() => {
  const fetchFavorites = async () => {
    const token = localStorage.getItem("idToken");
    if (!token) return; // Skip if not logged in

    try {
      const result = await getFavorites(); // full recipe objects
      const ids = result
        .map((item: any) => item.Id)
        .filter((id: any) => typeof id === "string" || typeof id === "number")
        .map(String); // ensure all IDs are strings

      setFavorites(new Set(ids));
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    }
  };

  fetchFavorites();
}, []);


  const handleFavorite = async (recipeId: string) => {
    if (favorites.has(recipeId)) return; // Already favorited

    setFavorites((prev) => new Set(prev).add(recipeId)); // Optimistic update

    try {
      await addFavorite(recipeId);
    } catch (err: any) {
      console.error("Error adding to favorites:", err.message);
      setFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
    }
  };

  const filteredRecipes = selectedCategory
    ? recipes.filter((r) => r.CategoryId === selectedCategory)
    : recipes;

  const countsByCategory = recipes.reduce((acc, recipe) => {
    const category = recipe.CategoryId || "all";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Recipes
      </Typography>

      <CategorySelectMUI
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={countsByCategory}
      />

      {error && (
        <Typography color="error" align="center" mt={2}>
          {error}
        </Typography>
      )}

      {filteredRecipes.length === 0 ? (
        <Typography align="center" mt={4}>No recipes yet.</Typography>
      ) : (
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          gap={2}
          mt={3}
        >
          {filteredRecipes.map((r) => (
            <Box key={r.Id}>
              <RecipeCard
                recipe={r}
                onFavorite={handleFavorite}
                isFavorite={favorites.has(r.Id)}
              />
            </Box>
          ))}
        </Box>
      )}

      {hasMore && !selectedCategory && (
        <Box textAlign="center" mt={4}>
          <Button variant="outlined" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
