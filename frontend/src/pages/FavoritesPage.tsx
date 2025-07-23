import React, { useEffect, useState } from "react";
import { getFavoriteRecipes } from "../API/getRecipes";
import { Recipe } from "../API/types";
import { RecipeCard } from "../components/RecipeCard";
import { useAuth } from "../context/AuthContext";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.sub) return;

      setLoading(true);
      setError("");
      
      try {
        const recipes = await getFavoriteRecipes(user.idToken);
        setFavoriteRecipes(recipes);
      } catch (err: any) {
        setError(err.message || "Failed to fetch favorite recipes");
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user?.sub]);

  if (!user) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary">
          Please log in to view your favorites
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your favorites...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
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
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          gap={2}
          mt={3}
        >
          {favoriteRecipes.map((recipe) => (
            <Box key={recipe.Id}>
              <RecipeCard recipe={recipe} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}