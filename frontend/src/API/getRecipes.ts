// src/API/getRecipes.ts
import { Recipe } from "./types";

export interface PaginatedRecipes {
  items: Recipe[];
  lastKey: string | null;
}

export async function getRecipes(lastKey?: string): Promise<PaginatedRecipes> {
  const url = new URL(
    "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Recipes"
  );
  if (lastKey) url.searchParams.append("lastKey", lastKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }

  // payload format 2.0: response.json() === the array or object you returned
  const data = await response.json() as PaginatedRecipes;
  return data;
}

export async function createRecipe(
  recipeData: Partial<Recipe>,
  token:      string
): Promise<Recipe> {
  const url = "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Recipes";
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







