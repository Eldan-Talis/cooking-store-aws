// src/API/getRecipes.ts
import { Recipe } from "./types";

export interface PaginatedRecipes {
  items: Recipe[];
  lastKey: string | null;
}

export async function getRecipes( lastKey?: string): Promise<PaginatedRecipes> {
  const url = new URL("https://qbk52rz2nl.execute-api.us-east-1.amazonaws.com/dev/get-recipes");

  if (lastKey) {
    url.searchParams.append("lastKey", lastKey);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }

  return await response.json(); // returns: { items: Recipe[], lastKey: string | null }
}
