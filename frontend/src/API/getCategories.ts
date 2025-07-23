import { Category } from "./types";

export async function getCategories(): Promise<Category[]> {
  const url = "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Categories";
  console.log("Fetching categories from:", url);
  
  const response = await fetch(url);
  console.log("Categories response status:", response.status);

  if (!response.ok) {
    console.error("Categories API error:", response.status, response.statusText);
    throw new Error("Failed to fetch categories");
  }

  // Check for empty response
  const text = await response.text();
  console.log("Categories response text:", text);
  
  if (!text) {
    console.log("Empty categories response, returning empty array");
    return []; // or throw an error if categories must exist
  }

  try {
    const parsed = JSON.parse(text);
    console.log("Parsed categories:", parsed);
    return parsed;
  } catch (e) {
    console.error("Error parsing categories JSON:", e);
    throw new Error("Categories response is not valid JSON");
  }
}

// Test function to check if the API endpoint exists
export async function testCategoriesEndpoint(): Promise<void> {
  const url = "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Categories";
  
  try {
    console.log("Testing categories endpoint...");
    const response = await fetch(url, { method: 'HEAD' });
    console.log("HEAD request status:", response.status);
    
    if (response.ok) {
      console.log("✅ Categories endpoint is accessible");
    } else {
      console.log("❌ Categories endpoint returned status:", response.status);
    }
  } catch (error) {
    console.error("❌ Categories endpoint test failed:", error);
  }
}
