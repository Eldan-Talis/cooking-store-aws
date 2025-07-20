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
export async function getFavorites(): Promise<string[]> {
  const token = localStorage.getItem("idToken");
  if (!token) return [];                     // not logged-in

  const res = await fetch(
    "https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Users/Favorites",
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    // propagate a meaningful error message
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch favorites");
  }

  /* ---------- parse & normalise ---------- */
  const payload = await res.json();          // parse once

  // 1) if the backend already returns string[], we're done
  if (Array.isArray(payload) && typeof payload[0] === "string") {
    return payload as string[];
  }

  // 2) otherwise assume array of objects → extract / stringify Id
  const ids = (Array.isArray(payload) ? payload : [])
    .map((item: any) => item?.Id ?? item?.recipe_id ?? item?.RecipeID)
    .filter(Boolean)                         // drop null / undefined
    .map(String);                            // ensure they’re strings

  return ids;
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
