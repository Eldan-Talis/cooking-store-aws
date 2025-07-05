import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import FavoritesPage from "./pages/FavoritesPage";
import RecipesPage from "./pages/MyRecipesPage";
import ChatBotPage from "./pages/ChatBotPage";
import { AuthProvider } from "./context/AuthContext"; // הנתיב בהתאם למיקום שלך

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/recipes" element={<RecipesPage />} />
      <Route path="/chat" element={<ChatBotPage />} />
      </Routes>
    </AuthProvider>
  );
}
