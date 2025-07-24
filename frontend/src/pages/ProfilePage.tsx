import React, { useState, useEffect } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Grid, 
  Chip, 
  Divider, 
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  CircularProgress
} from "@mui/material";
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  History as HistoryIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { getFavoriteRecipes } from "../API/favorites";
import { Recipe } from "../API/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: "Food enthusiast and recipe collector",
    preferences: [] as string[],
    joinDate: "January 2024"
  });

  // Calculate top 3 cuisine categories from favorite recipes
  const calculateTopCuisines = (recipes: Recipe[]): string[] => {
    const cuisineCount: { [key: string]: number } = {};
    
    recipes.forEach(recipe => {
      if (recipe.Couisine) {
        const cuisine = recipe.Couisine.trim();
        if (cuisine) {
          cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
        }
      }
    });

    // Sort by count and get top 3
    return Object.entries(cuisineCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cuisine]) => cuisine);
  };

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      if (!user?.sub) return;
      
      setLoading(true);
      try {
        const recipes = await getFavoriteRecipes(user.idToken);
        setFavoriteRecipes(recipes);
        console.log(recipes);
        // Update preferences with top 3 cuisines
        const topCuisines = calculateTopCuisines(recipes);
        setUserProfile(prev => ({
          ...prev,
          preferences: topCuisines.length > 0 ? topCuisines : ["No favorites yet"]
        }));
      } catch (error) {
        console.error("Failed to fetch favorite recipes:", error);
        setUserProfile(prev => ({
          ...prev,
          preferences: ["No favorites yet"]
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteRecipes();
  },[]);



  if (!user) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary">
          Please log in to view your profile
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, maxWidth: 1200, margin: "0 auto" }}>
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
        My Profile
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        {/* Profile Header Card */}
        <Box sx={{ gridColumn: 'span 12' }}>
          <Card sx={{ position: "relative", overflow: "visible" }}>
            <CardContent sx={{ padding: 4 }}>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    fontSize: "3rem",
                    bgcolor: "primary.main"
                  }}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="h4" component="h1">
                      {user.username}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Member since {userProfile.joinDate}
                  </Typography>
                  <Typography variant="body1">
                    {userProfile.bio}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Personal Information */}
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="User Name"
                    secondary={user.username}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Preferences */}
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FavoriteIcon />
                Top Cuisine Preferences
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {userProfile.preferences.map((pref, index) => (
                    <Chip
                      key={index}
                      label={pref}
                      color={pref === "No favorites yet" ? "default" : "primary"}
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Based on your favorite recipes
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
} 