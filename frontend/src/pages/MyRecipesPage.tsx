import React, { useEffect, useState } from "react";
import { getRecipes, createRecipe } from "../API/getRecipes";
import { Recipe } from "../API/types";
import { RecipeCard } from "../components/RecipeCard";
import { useAuth } from "../context/AuthContext";
import { getCategories } from "../API/getCategories";
import { Category } from "../API/types";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

export default function MyRecipesPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [creatingRecipe, setCreatingRecipe] = useState(false);
  
  // Form state for new recipe
  const [newRecipe, setNewRecipe] = useState({
    Title: "",
    Summery: "",
    InstructionsText: "",
    ImageUrl: "",
    CategoryId: "",
    ReadyInMinutes: "",
    Servings: "",
    Vegetarian: "false",
    Vegan: "false",
    GlutenFree: "false"
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch recipes created by the current user
        const recipesData = await getRecipes();
        const userRecipes = recipesData.items.filter(recipe => 
          recipe.CreatedByUserId === user?.sub
        );
        setRecipes(userRecipes);

        // Fetch categories for the form
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleAddRecipe = async () => {
    if (!user) return;

    setCreatingRecipe(true);
    try {
      const recipeData = {
        ...newRecipe,
        CreatedByUserId: user.sub,
        Publisher: user.username || user.email,
        SourceUrl: "",
        AverageRating: 0,
        RatingCount: 0
      };

      const createdRecipe = await createRecipe(recipeData, user.idToken);
      setRecipes(prev => [createdRecipe, ...prev]);
      setOpenAddDialog(false);
      setNewRecipe({
        Title: "",
        Summery: "",
        InstructionsText: "",
        ImageUrl: "",
        CategoryId: "",
        ReadyInMinutes: "",
        Servings: "",
        Vegetarian: "false",
        Vegan: "false",
        GlutenFree: "false"
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingRecipe(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary">
          Please log in to view your recipes
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          My Recipes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Recipe
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : recipes.length === 0 ? (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No recipes yet
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Start creating your own recipes!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
          >
            Create Your First Recipe
          </Button>
        </Box>
      ) : (
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          gap={2}
          mt={3}
        >
          {recipes.map((recipe) => (
            <Box key={recipe.Id}>
              <RecipeCard recipe={recipe} />
            </Box>
          ))}
        </Box>
      )}

      {/* Add Recipe Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Recipe</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Recipe Title"
              value={newRecipe.Title}
              onChange={(e) => handleInputChange("Title", e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Summary"
              multiline
              rows={3}
              value={newRecipe.Summery}
              onChange={(e) => handleInputChange("Summery", e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Instructions"
              multiline
              rows={6}
              value={newRecipe.InstructionsText}
              onChange={(e) => handleInputChange("InstructionsText", e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Image URL"
              value={newRecipe.ImageUrl}
              onChange={(e) => handleInputChange("ImageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newRecipe.CategoryId}
                  onChange={(e) => handleInputChange("CategoryId", e.target.value)}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.Id} value={category.Id}>
                      {category.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Ready In (minutes)"
                type="number"
                value={newRecipe.ReadyInMinutes}
                onChange={(e) => handleInputChange("ReadyInMinutes", e.target.value)}
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Servings"
                type="number"
                value={newRecipe.Servings}
                onChange={(e) => handleInputChange("Servings", e.target.value)}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Dietary Options</InputLabel>
                <Select
                  multiple
                  value={[
                    ...(newRecipe.Vegetarian === "true" ? ["Vegetarian"] : []),
                    ...(newRecipe.Vegan === "true" ? ["Vegan"] : []),
                    ...(newRecipe.GlutenFree === "true" ? ["GlutenFree"] : [])
                  ]}
                  onChange={(e) => {
                    const values = e.target.value as string[];
                    handleInputChange("Vegetarian", values.includes("Vegetarian") ? "true" : "false");
                    handleInputChange("Vegan", values.includes("Vegan") ? "true" : "false");
                    handleInputChange("GlutenFree", values.includes("GlutenFree") ? "true" : "false");
                  }}
                  label="Dietary Options"
                >
                  <MenuItem value="Vegetarian">Vegetarian</MenuItem>
                  <MenuItem value="Vegan">Vegan</MenuItem>
                  <MenuItem value="GlutenFree">Gluten Free</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddRecipe}
            variant="contained"
            disabled={creatingRecipe || !newRecipe.Title || !newRecipe.CategoryId}
          >
            {creatingRecipe ? <CircularProgress size={20} /> : "Create Recipe"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}