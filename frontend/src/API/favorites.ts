export async function addFavorite(recipeId: string) {
  const token = localStorage.getItem("idToken"); // or however you store it

  const res = await fetch("https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ recipeId: recipeId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to favorite recipe");
  }
}
import { Recipe } from "../API/types";

/** Returns the full favourite recipes for the logged-in user. */
export async function getFavorites(): Promise<Recipe[]> {
  const token = localStorage.getItem("idToken");
  if (!token) return [];                                   // user signed-out

  const res = await fetch(
    "https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites",
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch favourites");
  }

  return res.json();               // read body once  
}

export async function removeFavorite(recipeId: string) {
  const token = localStorage.getItem("idToken"); // or however you store it

  const res = await fetch(`https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ recipeId: recipeId })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to unfavorite recipe");
  }
}
