// src/API/getRecipes.ts
import { Recipe } from "./types";

export interface PaginatedRecipes {
  items: Recipe[];
  lastKey: string | null;
}

export async function getRecipes(lastKey?: string): Promise<PaginatedRecipes> {
  const url = new URL("https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Recipes");
  if (lastKey) url.searchParams.append("lastKey", lastKey);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to fetch recipes");

  const raw = await response.json();
  return JSON.parse(raw.body); // ✅ now body has items + lastKey
}
