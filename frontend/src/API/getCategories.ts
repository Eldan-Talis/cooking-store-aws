import { Category } from "./types";

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(
    "https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Category"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }
    const raw = await response.json();
  return JSON.parse(raw.body); // manually parse the stringified array
}
