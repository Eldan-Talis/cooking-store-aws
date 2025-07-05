export async function addFavorite(recipeId: string) {
  const token = localStorage.getItem("idToken"); // or however you store it

  const res = await fetch("https://qbk52rz2nl.execute-api.us-east-1.amazonaws.com/dev/get-favorites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ recipe_id: recipeId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to favorite recipe");
  }
}
export async function getFavorites() {
  const token = localStorage.getItem("idToken"); // or however you store it

  const res = await fetch("https://qbk52rz2nl.execute-api.us-east-1.amazonaws.com/dev/get-favorites", {
    headers: {
      "Authorization": `Bearer ${token}`
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch favorites");
  }

  return await res.json(); // returns: string[]
}