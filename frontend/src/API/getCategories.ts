import { Category } from "./types";

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(
    "https://qbk52rz2nl.execute-api.us-east-1.amazonaws.com/dev/get-categories"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }
  return response.json();
}
