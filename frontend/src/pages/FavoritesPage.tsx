// src/pages/FavoritesPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert
} from "@mui/material";

import { getFavoriteRecipes } from "../API/favorites";
import { Recipe } from "../API/types";
import { RecipeCard } from "../components/RecipeCard";
import { useAuth } from "../context/AuthContext";

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();

  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  /* ─── fetch once per login ─── */
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.idToken) return;

      setLoading(true);
      setError("");

      try {
        const recipes = await getFavoriteRecipes();
        setFavoriteRecipes(recipes);
      } catch (err: any) {
        console.error("Error fetching favorites:", err);
        setError(err.message ?? "Failed to fetch favorite recipes");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user?.idToken]);

  /* ─── early guards ─── */
  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary">
          Please log in to view your favorites
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your favorites…
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  /* ─── main render ─── */
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        My Favorite Recipes
      </Typography>

      {favoriteRecipes.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No favorite recipes yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start adding recipes to your favorites to see them here!
          </Typography>
        </Box>
      ) : (
        /* outer flex to centre grid block */
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              display: "grid",
              /*    xs → 1 col | sm → 2 cols | md+ → 3 cols    */
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
              /* keep rows equal-height so card bottoms align */
              gridAutoRows: "1fr",
              /* limit max width so only 3 cards fit, then centre */
              width: "100%",
              maxWidth: 1140, // 3×360px cards + ~ gaps
            }}
          >
            {favoriteRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.Id}
                recipe={recipe}
                isFav={true}
                onFavToggle={(id, nowFav) => {
                  /* remove it locally if user unfavourites */
                  if (!nowFav) {
                    setFavoriteRecipes((prev) =>
                      prev.filter((r) => r.Id !== id)
                    );
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FavoritesPage;
