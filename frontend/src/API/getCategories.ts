import { Category } from "./types";

export async function getCategories(): Promise<Category[]> {
  const url = "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Categories";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  // Check for empty response
  const text = await response.text();
  if (!text) {
    return []; // or throw an error if categories must exist
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Categories response is not valid JSON");
  }
}
