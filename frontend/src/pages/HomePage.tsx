// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { getRecipes } from "../API/getRecipes";
import { Recipe } from "../API/types";
import { RecipeCard } from "../components/RecipeCard";

import "../style/RecipeCard.css";
import "../style/RecipeGrid.css";
import "../style/Page.css";

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRecipes()
      .then(setRecipes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <main className="page">
      <h1 style={{ textAlign: "center" }}>Recipes</h1>

      {recipes.length === 0 ? (
        <p>No recipes yet.</p>
      ) : (
        <div className="recipe-grid">
          {recipes.map((r) => (
            <RecipeCard key={r.Id} recipe={r} />
          ))}
        </div>
      )}
    </main>
  );
}
