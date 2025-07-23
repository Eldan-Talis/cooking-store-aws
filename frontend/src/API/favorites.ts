import { Recipe } from "./types";

const token = localStorage.getItem("idToken");

export async function getFavoriteRecipes(): Promise<Recipe[]> {
  const res = await fetch(
    "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites",
    {
      method:  "GET",
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch favorites");
  }

  // `await res.json()` is *already* your Recipe[] directly
  const data = await res.json();
  return data as Recipe[];
}

export async function addToFavorites(recipeId: string): Promise<void> {
  const url = "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites";
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ RecipeId: recipeId })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add recipe to favorites');
  }
}

export async function removeFavorite(recipeId: string) {

  const res = await fetch(`https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ RecipeId: recipeId })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to unfavorite recipe");
  }
}
