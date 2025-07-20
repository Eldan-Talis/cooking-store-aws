// src/pages/FavoritesPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

import { getFavorites } from "../API/favorites";
import { Recipe } from "../API/types";
import { RecipeCard } from "../components/RecipeCard";
import { useAuth } from "../context/AuthContext";

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();                       // signed-in user

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  /* fetch favourites once (and on user change) */
  useEffect(() => {
    if (!user) {                       // logged-out
      setRecipes([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getFavorites()
      .then((arr) => !cancelled && setRecipes(arr))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [user]);

  /* ───────────── render ───────────── */
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        My Favourite Recipes
      </Typography>

      {loading && (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2, maxWidth: 600, mx: "auto" }}>
          {error}
        </Alert>
      )}

      {!loading && recipes.length === 0 && !error && (
        <Typography align="center" mt={4}>
          {user
            ? "You haven’t liked any recipes yet."
            : "Please log in to view your favourites."}
        </Typography>
      )}

      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        gap={2}
        mt={3}
      >
        {recipes.map((r) => (
          <RecipeCard
            key={r.Id}
            recipe={r}
            isFav={true}                   /* every card is liked */
            onFavToggle={(id, nowFav) => {
              /* remove from list immediately when un-liked */
              if (!nowFav) {
                setRecipes((prev) => prev.filter((rec) => rec.Id !== id));
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default FavoritesPage;
