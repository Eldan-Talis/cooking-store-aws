// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

import { getRecipes } from "../API/getRecipes";
import { getFavorites } from "../API/favorites";
import { getCategories } from "../API/getCategories";

import { Recipe } from "../API/types";
import { RecipeCard } from "../components/RecipeCard";
import CategorySelectMUI from "../components/CategorySlide";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  /* ─────────────────── auth ─────────────────── */
  const { user } = useAuth();

  /* ────────────────── state ─────────────────── */
  const [recipes, setRecipes]         = useState<Recipe[]>([]);
  const [favorites, setFavorites]     = useState<Set<string>>(new Set());
  const [categories, setCategories]   = useState<any[]>([]);
  const [selectedCategory, setSelect] = useState<string | null>(null);

  const [lastKey, setLastKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  /* ───────────────── recipes (paged) ─────────── */
  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const data = await getRecipes(lastKey ?? undefined);
      setRecipes(prev => [...prev, ...data.items]);
      setLastKey(data.lastKey ?? null);
      setHasMore(Boolean(data.lastKey));
    } catch (err: any) {
      setError(err.message ?? "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMore();          // initial page
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ───────────────── categories ─────────────── */
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message ?? "Failed to load categories"));
  }, []);

  /* ───────────────── favourites (once) ───────── */
  useEffect(() => {
    if (!user) {
      setFavorites(new Set());
      return;
    }
    getFavorites()
      .then(arr => setFavorites(new Set(arr.map(String))))
      .catch(() => setFavorites(new Set()));
  }, [user]);

  /* ───────────────── derived data ────────────── */
  const filteredRecipes = selectedCategory
    ? recipes.filter(r => r.CategoryId === selectedCategory)
    : recipes;

  const countsByCategory = recipes.reduce<Record<string, number>>((acc, r) => {
    const cat = r.CategoryId || "all";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  /* ───────────────── render ──────────────────── */
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Recipes
      </Typography>

      {/* category selector */}
      <CategorySelectMUI
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={setSelect}
        categoryCounts={countsByCategory}
      />

      {/* error banner */}
      {error && (
        <Typography color="error" align="center" mt={2}>
          {error}
        </Typography>
      )}

      {/* cards grid */}
      {filteredRecipes.length === 0 ? (
        <Typography align="center" mt={4}>
          {loading ? "Loading…" : "No recipes yet."}
        </Typography>
      ) : (
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          gap={2}
          mt={3}
        >
          {filteredRecipes.map(r => (
            <RecipeCard
              key={r.Id}
              recipe={r}
              isFav={favorites.has(String(r.Id))}
              onFavToggle={(id, nowFav) => {
                setFavorites(prev => {
                  const next = new Set(prev);
                  nowFav ? next.add(String(id)) : next.delete(String(id));
                  return next;
                });
              }}
            />
          ))}
        </Box>
      )}

      {/* load-more button */}
      {hasMore && !selectedCategory && (
        <Box textAlign="center" mt={4}>
          <Button variant="outlined" onClick={loadMore} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Load More"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
