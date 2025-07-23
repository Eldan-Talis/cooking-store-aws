// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar       from "./components/NavBar";
import HomePage     from "./pages/HomePage";
import FavoritesPage from "./pages/FavoritesPage";
import ChatBotPage  from "./pages/ChatBotPage";
import ProfilePage  from "./pages/ProfilePage";
import AdminPage    from "./pages/AdminPage";

import { AuthProvider, useAuth } from "./context/AuthContext";

/* ─── small guard component ─── */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;                     // or a spinner
  if (user?.groups?.includes("Admin")) return children;

  return <Navigate to="/" replace />;           // fallback
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />

      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/chat"      element={<ChatBotPage />} />
        <Route path="/profile"   element={<ProfilePage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
