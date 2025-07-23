// src/API/useFavoritesApi.ts
import { Recipe } from "./types";
import { useAuth } from "../context/AuthContext";

const BASE =
  "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites";

/* ------------------------------------------------------------------ */
/*  Option A → never return an empty header object                    */
/* ------------------------------------------------------------------ */
function authHeaders(idToken: string): HeadersInit {
  return { Authorization: `Bearer ${idToken}` };
}

/* ------------------------------------------------------------------ */
/*  Hook exposing favourites API                                      */
/* ------------------------------------------------------------------ */
export function useFavoritesApi() {
  const { user } = useAuth();
  const idToken = user?.idToken;

  /** GET /Users/Favorites */
  async function getFavoriteRecipes(): Promise<Recipe[]> {
    if (!idToken) throw new Error("Not authenticated");
    const res = await fetch(BASE, { headers: authHeaders(idToken) });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to fetch favorites");
    }
    return res.json();
  }

  /** POST /Users/Favorites */
  async function addToFavorites(recipeId: string): Promise<void> {
    if (!idToken) throw new Error("Not authenticated");
    const res = await fetch(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(idToken),
      },
      body: JSON.stringify({ RecipeId: recipeId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to add favorite");
    }
  }

  /** DELETE /Users/Favorites */
  async function removeFavorite(recipeId: string): Promise<void> {
    if (!idToken) throw new Error("Not authenticated");
    const res = await fetch(BASE, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(idToken),
      },
      body: JSON.stringify({ RecipeId: recipeId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to remove favorite");
    }
  }

  return { getFavoriteRecipes, addToFavorites, removeFavorite };
}
