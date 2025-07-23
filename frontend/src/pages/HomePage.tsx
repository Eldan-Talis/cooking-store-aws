import React, { useEffect, useState } from "react";
import { getRecipes, getRecipeCountsByCategory } from "../API/getRecipes";
import { Recipe } from "../API/types";
import { RecipeCard } from "../components/RecipeCard";
import { getCategories } from "../API/getCategories";
import CategorySelectMUI from "../components/CategorySlide";

import { Box, CircularProgress, Button, Typography } from "@mui/material";

export default function HomePage() {

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const [lastKey, setLastKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const data = await getRecipes( lastKey ?? undefined);
      setRecipes((prev) => [...prev, ...data.items]);
      setLastKey(data.lastKey ?? null);
      setHasMore(Boolean(data.lastKey));
    } catch (err: any) {
      setError(err.message);
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
      .catch((err) => setError(err.message));
    
    // Fetch total recipe counts by category
    getRecipeCountsByCategory()
      .then(setCategoryCounts)
      .catch((err) => {
        console.error("Failed to fetch category counts:", err);
        // Fallback to calculating from loaded recipes
        const counts = recipes.reduce((acc, recipe) => {
          const category = recipe.CategoryId || "all";
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setCategoryCounts(counts);
      });
  }, []);

  const filteredRecipes = selectedCategory
    ? recipes.filter((r) => r.CategoryId === selectedCategory)
    : recipes;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Recipes
      </Typography>

      <CategorySelectMUI
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
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
              <RecipeCard recipe={r} />
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
