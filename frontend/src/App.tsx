import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import FavoritesPage from "./pages/FavoritesPage";
import ChatBotPage from "./pages/ChatBotPage";
import ProfilePage from "./pages/ProfilePage";
import MyRecipesPage from "./pages/MyRecipesPage";
import { AuthProvider } from "./context/AuthContext"; 
export default function App() {
  return (
    <>
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/chat" element={<ChatBotPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-recipes" element={<MyRecipesPage />} />
      </Routes>
    </AuthProvider>
    </>
  );
}
