import React, { useEffect, useState } from 'react';
import { Recipe } from "../API/types";
import "../style/recipeCard.css";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
    return (
      <div className="card">
        <img src={recipe.ImageUrl} alt={recipe.Title} />
        <h3>{recipe.Title}</h3>
        <a href={recipe.SourceUrl} target="_blank" rel="noreferrer">
          View ↗
        </a>
      </div>
    );
  }
