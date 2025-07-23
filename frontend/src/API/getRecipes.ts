// src/API/getRecipes.ts
import { Recipe } from "./types";

export interface PaginatedRecipes {
  items: Recipe[];
  lastKey: string | null;
}

export async function getRecipes( lastKey?: string): Promise<PaginatedRecipes> {
  const url = new URL("https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Recipes");

  if (lastKey) {
    url.searchParams.append("lastKey", lastKey);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }

  const raw = await response.json();
  return JSON.parse(raw.body); // manually parse the stringified array
}

export async function getFavoriteRecipes(token: string): Promise<Recipe[]> {
  const res = await fetch(
    "https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites",
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

export async function getRecipeCountsByCategory(): Promise<Record<string, number>> {
  const url = new URL("https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Recipes/counts");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch recipe counts");
  }

  const raw = await response.json();
  return JSON.parse(raw.body); // manually parse the stringified object
}

export async function addToFavorites(recipeId: string, token: string): Promise<void> {
  const url = "https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites";
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ recipeId })  // ← no userId here
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add recipe to favorites');
  }
}

export async function createRecipe(
  recipeData: Partial<Recipe>,
  token:      string
): Promise<Recipe> {
  const url = "https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Recipes";
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(recipeData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create recipe');
  }

  // THIS IS ALREADY YOUR RECIPE OBJECT
  const createdRecipe = await response.json();
  return createdRecipe;
}





