// src/API/getRecipes.ts
import { Recipe } from "./types";

export interface PaginatedRecipes {
  items: Recipe[];
  lastKey?: string;
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

  const data = await response.json() as PaginatedRecipes;
  return data;
}

export async function createRecipe(recipeData: any, idToken: string): Promise<Recipe> {
  const response = await fetch(
    "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Recipes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify(recipeData)
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create recipe");
  }

  const createdRecipe = await response.json();
  return createdRecipe;
}

export async function getUserRecipes(userId: string, idToken: string): Promise<Recipe[]> {
  // Try path parameter approach first
  const encodedUserId = encodeURIComponent(userId);
  const url = `https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Users/${encodedUserId}`;
  console.log("Fetching user recipes from:", url);
  console.log("Original userId:", userId);
  console.log("Encoded userId:", encodedUserId);
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    }
  });

  console.log("User recipes response status:", response.status);

  if (!response.ok) {
    console.error("User recipes API error:", response.status, response.statusText);
    const errorText = await response.text();
    console.error("User recipes error response:", errorText);
    
    // If it's a 400 error about missing userId, try query parameter approach
    if (response.status === 400 && errorText.includes("Missing userId")) {
      console.log("Trying alternative approach with query parameter...");
      return getUserRecipesWithQueryParam(userId, idToken);
    }
    
    // If it's a 404, the endpoint doesn't exist
    if (response.status === 404) {
      console.log("User recipes endpoint doesn't exist (404), will use fallback");
      throw new Error("User recipes endpoint not found - using fallback");
    }
    
    throw new Error(`Failed to fetch user recipes: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("User recipes data received:", data);
  return Array.isArray(data) ? data : [];
}

// Alternative function using query parameter
async function getUserRecipesWithQueryParam(userId: string, idToken: string): Promise<Recipe[]> {
  const url = `https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Users?userId=${encodeURIComponent(userId)}`;
  console.log("Trying query parameter approach:", url);
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    }
  });

  console.log("Query param approach response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Query param approach also failed:", errorText);
    
    // If it's a 404, the endpoint doesn't exist
    if (response.status === 404) {
      console.log("User recipes endpoint doesn't exist (404), will use fallback");
      throw new Error("User recipes endpoint not found - using fallback");
    }
    
    throw new Error(`Failed to fetch user recipes with query param: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("User recipes data received (query param):", data);
  return Array.isArray(data) ? data : [];
}

export async function deleteRecipe(recipeId: string, idToken: string, userId?: string): Promise<void> {
  console.log("Attempting to delete recipe:", recipeId);
  console.log("User ID:", userId);
  
  const payload: any = { 
    recipeId: recipeId
  };

  // Add userId if provided
  if (userId) {
    payload.userId = userId;
  }

  // You can also include additional data if needed
  // payload.action = "delete";
  // payload.timestamp = new Date().toISOString();

  console.log("Delete payload:", payload);
  
  const response = await fetch(
    "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Recipes",
    {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  console.log("Delete response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.log("Delete error response:", errorText);
    throw new Error(`Failed to delete recipe: ${response.status} ${response.statusText}`);
  }

  console.log("Recipe deleted successfully");
}