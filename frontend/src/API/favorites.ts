import { Recipe } from "./types";

export async function getFavoriteRecipes(idToken: string): Promise<Recipe[]> {
  // Early return if no token provided
  if (!idToken) {
    console.log("getFavoriteRecipes called with no token - returning empty array");
    return [];
  }
  
  console.log("Getting favorite recipes with token:", idToken ? "Token exists" : "No token");
  console.log("Token length:", idToken?.length);
  console.log("Token starts with:", idToken?.substring(0, 20) + "...");
  console.log("Full Authorization header:", `Bearer ${idToken}`);
  
  // Check if token is expired
  try {
    const tokenPayload = JSON.parse(atob(idToken.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    console.log("Token expiration:", new Date(tokenPayload.exp * 1000));
    console.log("Current time:", new Date(currentTime * 1000));
    console.log("Token expired:", tokenPayload.exp < currentTime);
  } catch (e) {
    console.log("Could not decode token payload:", e);
  }
  
  const res = await fetch(
    "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites",
    {
      method:  "GET",
      headers: { Authorization: `Bearer ${idToken}` }
    }
  );

  console.log("Favorites response status:", res.status);
  console.log("Favorites response headers:", Object.fromEntries(res.headers.entries()));

  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch (e) {
      err = { error: "Could not parse error response" };
    }
    console.error("Favorites API error:", err);
    console.error("Full error response:", err);
    throw new Error(err.error || err.message || "Failed to fetch favorites");
  }

  // `await res.json()` is *already* your Recipe[] directly
  const data = await res.json();
  return data as Recipe[];
}

export async function addToFavorites(recipeId: string, idToken: string): Promise<void> {
  // Early return if no token provided
  if (!idToken) {
    console.log("addToFavorites called with no token - throwing error");
    throw new Error("No authentication token provided");
  }
  
  console.log("Adding to favorites with token:", idToken ? "Token exists" : "No token");
  console.log("Token length:", idToken?.length);
  console.log("Token starts with:", idToken?.substring(0, 20) + "...");
  
  const url = "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites";
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ RecipeId: recipeId })
  });

  console.log("Add to favorites response status:", response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Add to favorites API error:", errorData);
    throw new Error(errorData.error || 'Failed to add recipe to favorites');
  }
}

export async function removeFavorite(recipeId: string, idToken: string) {
  // Early return if no token provided
  if (!idToken) {
    console.log("removeFavorite called with no token - throwing error");
    throw new Error("No authentication token provided");
  }
  
  console.log("Removing from favorites with token:", idToken ? "Token exists" : "No token");
  console.log("Token length:", idToken?.length);
  console.log("Token starts with:", idToken?.substring(0, 20) + "...");
  
  const res = await fetch(`https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify({ RecipeId: recipeId })
  });

  console.log("Remove from favorites response status:", res.status);

  if (!res.ok) {
    const err = await res.json();
    console.error("Remove from favorites API error:", err);
    throw new Error(err.message || "Failed to unfavorite recipe");
  }
}
