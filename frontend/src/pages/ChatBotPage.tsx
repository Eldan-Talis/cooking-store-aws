import React, { useEffect, useState } from "react";
import { getRecipes } from "../API/getRecipes";
import { Recipe } from "../API/types";
import { RecipeCard } from "../components/RecipeCard";
import  CenteredChatbot  from "../components/Chatbot"

export default function ChatBotPage() {
  return <CenteredChatbot/>;
}