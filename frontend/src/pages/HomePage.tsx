// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Avatar,
} from "@mui/material";

import { getRecipes } from "../API/getRecipes";
import { getFavoriteRecipes } from "../API/favorites";
import { getCategories } from "../API/getCategories";

import { Recipe } from "../API/types";
import { RecipeCard } from "../components/RecipeCard";
import CategorySelectMUI from "../components/CategorySlide";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  /* ─────────────────── auth ─────────────────── */
  const { user } = useAuth();

  /* ────────────────── state ─────────────────── */
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelect] = useState<string | null>(null);

  const [lastKey, setLastKey] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ───────────────── recipes (paged) ─────────── */
  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const { items, lastKey: nextKey } = await getRecipes(lastKey ?? undefined);

      setRecipes(prev => [...prev, ...items]);
      setLastKey(nextKey);
      setHasMore(Boolean(nextKey)); // If nextKey exists, we have more pages
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
    getFavoriteRecipes()
      .then((recipes) => {
        console.log("Fetched favorites:", recipes)
        // recipes: Recipe[]  →  Set<string>
        setFavorites(new Set(recipes.map((r) => String(r.Id))))
      }
      )
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
    <>
      {/* Hero Section - now full width */}
      <Paper
        elevation={6}
        sx={{
          background: "linear-gradient(120deg, #e3f2fd 0%, #bbdefb 100%)",
          backgroundSize: "200% 200%",
          animation: "gradientFlow 8s ease-in-out infinite",
          "@keyframes gradientFlow": {
            "0%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
            "100%": { backgroundPosition: "0% 50%" },
          },
          borderRadius: 0,
          boxShadow: "0 8px 32px 0 rgba(33,150,243,0.15)",
          position: "relative",
          overflow: "hidden",
          width: "100vw",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          p: { xs: 4, md: 8 },
          mb: 0,
        }}
      >
        <Stack
          direction="column"
          alignItems="center"
          spacing={3}
          sx={{ position: "relative", zIndex: 1 }}
        >

          <Typography
            variant="h2"
            sx={{
              color: "#1976d2",
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.8rem" },
              letterSpacing: 1,
            }}
          >
            Welcome to Cooking Store!
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#333",
              mt: 1,
              maxWidth: 600,
              mx: "auto",
              fontWeight: 400,
              fontSize: { xs: "1.1rem", md: "1.25rem" },
            }}
          >
            Discover, share, and save your favorite recipes.<br />
            <span style={{ color: "#1976d2", fontWeight: 600 }}>
              Start your culinary adventure today!
            </span>
          </Typography>
        </Stack>
        {/* Decorative background circle */}
        <Box
          sx={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 200,
            height: 200,
            bgcolor: "#90caf9",
            opacity: 0.25,
            borderRadius: "50%",
            zIndex: 0,
          }}
        />
        {/* Wavy SVG at the bottom */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            lineHeight: 0,
            zIndex: 2,
          }}
        >
          <svg
            viewBox="0 0 1440 100"
            width="100%"
            height="100"
            preserveAspectRatio="none"
            style={{ display: "block" }}
          >
            <path
              d="M0,40 C360,120 1080,0 1440,60 L1440,100 L0,100 Z"
              fill="#90caf9"
              fillOpacity="0.5"
            />
            <path
              d="M0,60 C480,0 960,120 1440,40 L1440,100 L0,100 Z"
              fill="#1976d2"
              fillOpacity="0.3"
            />
          </svg>
        </Box>
      </Paper>
      {/* Main content with padding */}
      <Box sx={{ p: 4 }}>
        <Typography
          variant="h3"
          align="center"
          sx={{
            color: "#1976d2",
            fontWeight: 800,
            letterSpacing: 1,
            textShadow: "0 2px 8px rgba(25,118,210,0.10)",
            mb: 4,
          }}
        >
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
    </>
  );
}
