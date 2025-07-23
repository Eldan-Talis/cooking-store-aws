import React, { useEffect, useState } from "react";
import { getUserRecipes, createRecipe, getRecipes, deleteRecipe } from "../API/getRecipes";
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
  Paper,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

export default function MyRecipesPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [creatingRecipe, setCreatingRecipe] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  
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
      
      // Fetch user's recipes directly from the API
      if (user?.sub && user?.idToken) {
        try {
          console.log("Fetching user recipes...");
          const userRecipes = await getUserRecipes(user.sub, user.idToken);
          console.log("User recipes received:", userRecipes);
          setRecipes(userRecipes);
        } catch (recipesError: any) {
          console.error("Error fetching user recipes:", recipesError);
          
          // If it's the specific "endpoint not found" error, use fallback silently
          if (recipesError.message.includes("endpoint not found")) {
            console.log("Using fallback approach for user recipes...");
          } else {
            console.log("Trying fallback: fetch all recipes and filter by user...");
          }
          
          // Fallback: fetch all recipes and filter by user
          try {
            const allRecipes = await getRecipes();
            const userRecipes = allRecipes.items.filter(recipe => 
              recipe.CreatedByUserId === user.sub
            );
            console.log("Fallback user recipes:", userRecipes);
            setRecipes(userRecipes);
          } catch (fallbackError: any) {
            console.error("Fallback also failed:", fallbackError);
            // Only show error if both approaches fail
            setError(`Failed to load recipes: ${fallbackError.message}`);
          }
        }
      }

      // Fetch categories for the form (separate from recipes)
      console.log("Fetching categories...");
      setCategoriesLoading(true);
      try {
        const categoriesData = await getCategories();
        console.log("Categories received:", categoriesData);
        setCategories(categoriesData);
      } catch (categoriesError: any) {
        console.error("Error fetching categories:", categoriesError);
        // Don't set the main error for categories, just log it
        // You could set a separate categories error state if needed
      } finally {
        setCategoriesLoading(false);
      }
      
      setLoading(false);
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
        Title: newRecipe.Title,
        Summery: newRecipe.Summery,
        InstructionsText: newRecipe.InstructionsText,
        ImageUrl: newRecipe.ImageUrl || "",
        CategoryId: newRecipe.CategoryId,
        ReadyInMinutes: parseInt(newRecipe.ReadyInMinutes) || 0,
        Servings: parseInt(newRecipe.Servings) || 1,
        Vegetarian: newRecipe.Vegetarian === "true" ? "1" : "0",
        Vegan: newRecipe.Vegan === "true" ? "1" : "0",
        GlutenFree: newRecipe.GlutenFree === "true" ? "1" : "0",
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

  const handleDeleteClick = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete || !user?.idToken) return;

    setDeletingRecipe(true);
    try {
      await deleteRecipe(recipeToDelete.Id, user.idToken, user.sub);
      // Remove the recipe from the local state
      setRecipes(prev => prev.filter(recipe => recipe.Id !== recipeToDelete.Id));
      setOpenDeleteDialog(false);
      setRecipeToDelete(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingRecipe(false);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setRecipeToDelete(null);
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
        My Recipes
      </Typography>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={4}>
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
            <Box key={recipe.Id} sx={{ position: "relative" }}>
              <RecipeCard
                recipe={recipe}
                isFav={false} // or your logic to determine if it's a favorite
                onFavToggle={() => {}} // or your handler function
              />
              <IconButton
                onClick={() => handleDeleteClick(recipe)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 1)",
                  },
                }}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
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
                  disabled={categoriesLoading}
                >
                  {categoriesLoading ? (
                    <MenuItem disabled>Loading categories...</MenuItem>
                  ) : categories.length === 0 ? (
                    <MenuItem disabled>No categories available</MenuItem>
                  ) : (
                    categories.map((category) => (
                      <MenuItem key={category.Id} value={category.Id}>
                        {category.Name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {categories.length === 0 && !categoriesLoading && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    Debug: Categories count: {categories.length}
                  </Typography>
                )}
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
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

      {/* Delete Recipe Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Recipe</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{recipeToDelete?.Title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deletingRecipe}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deletingRecipe}
          >
            {deletingRecipe ? <CircularProgress size={20} /> : "Delete Recipe"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}