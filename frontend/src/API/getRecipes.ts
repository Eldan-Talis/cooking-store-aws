// src/API/getRecipes.ts
import { Recipe } from "./types";

export async function getRecipes(): Promise<Recipe[]> {
  const response = await fetch(
    "https://qbk52rz2nl.execute-api.us-east-1.amazonaws.com/get-recipes"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }
  return response.json();
}
