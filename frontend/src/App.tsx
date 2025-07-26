// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar       from "./components/NavBar";
import HomePage     from "./pages/HomePage";
import FavoritesPage from "./pages/FavoritesPage";
import ChatBotPage  from "./pages/ChatBotPage";
import ProfilePage  from "./pages/ProfilePage";
import MyRecipesPage from "./pages/MyRecipesPage";
import AdminPage    from "./pages/AdminPage";

import { AuthProvider, useAuth } from "./context/AuthContext";

/* ─── small guard component ─── */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Show loading spinner while auth is initializing
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Only redirect if we're sure the user is not an admin
  if (user && !user.groups?.includes("Admin")) {
    return <Navigate to="/" replace />;
  }

  // If no user, show login message instead of redirecting
  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Please log in to access admin panel</div>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />

      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/my-recipes" element={<MyRecipesPage />} />
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
