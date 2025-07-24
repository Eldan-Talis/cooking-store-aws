import React from "react";
import { AppBar, Toolbar, Typography, Button, Avatar, IconButton, Box } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import ChefHat from "../assets/chef.png";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const location = useLocation();

  /* is the current user in the Admin Cognito group? */
  const isAdmin = user?.groups?.includes("Admin") ?? false;

  /* fallback avatar letter */
  const avatarContent =
    user?.profileImage ? undefined : user?.username?.[0].toUpperCase() ?? "U";

  return (
    <AppBar position="static" color="default" elevation={2}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Brand */}
        <Box
          display="flex"
          alignItems="center"
          component={RouterLink}
          to="/"
          sx={{ textDecoration: "none" }}
        >
          <img src={ChefHat} alt="ChefBot logo" style={{ height: 40, marginRight: 8 }} />
          <Typography variant="h6" color="textPrimary">
            ChefBot
          </Typography>
        </Box>

        {/* Center: Nav links */}
        <Box display="flex" gap={2}>
          <Button 
            component={RouterLink} 
            to="/" 
            color="inherit"
            sx={{
              backgroundColor: location.pathname === "/" ? "rgba(25, 118, 210, 0.1)" : "transparent",
              fontWeight: location.pathname === "/" ? 600 : 400,
              "&:hover": {
                backgroundColor: location.pathname === "/" ? "rgba(25, 118, 210, 0.15)" : "rgba(0, 0, 0, 0.04)"
              }
            }}
          >
            Home
          </Button>
          <Button 
            component={RouterLink} 
            to="/favorites" 
            color="inherit"
            sx={{
              backgroundColor: location.pathname === "/favorites" ? "rgba(25, 118, 210, 0.1)" : "transparent",
              fontWeight: location.pathname === "/favorites" ? 600 : 400,
              "&:hover": {
                backgroundColor: location.pathname === "/favorites" ? "rgba(25, 118, 210, 0.15)" : "rgba(0, 0, 0, 0.04)"
              }
            }}
          >
            Favorites
          </Button>
          {user && (
            <Button 
              component={RouterLink} 
              to="/my-recipes" 
              color="inherit"
              sx={{
                backgroundColor: location.pathname === "/my-recipes" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                fontWeight: location.pathname === "/my-recipes" ? 600 : 400,
                "&:hover": {
                  backgroundColor: location.pathname === "/my-recipes" ? "rgba(25, 118, 210, 0.15)" : "rgba(0, 0, 0, 0.04)"
                }
              }}
            >
              My Recipes
            </Button>
          )}
          <Button 
            component={RouterLink} 
            to="/chat" 
            color="inherit"
            sx={{
              backgroundColor: location.pathname === "/chat" ? "rgba(25, 118, 210, 0.1)" : "transparent",
              fontWeight: location.pathname === "/chat" ? 600 : 400,
              "&:hover": {
                backgroundColor: location.pathname === "/chat" ? "rgba(25, 118, 210, 0.15)" : "rgba(0, 0, 0, 0.04)"
              }
            }}
          >
            Chat Bot
          </Button>
          {isAdmin && (
            <Button 
              component={RouterLink} 
              to="/admin" 
              color="inherit"
              sx={{
                backgroundColor: location.pathname === "/admin" ? "rgba(25, 118, 210, 0.1)" : "transparent",
                fontWeight: location.pathname === "/admin" ? 600 : 400,
                "&:hover": {
                  backgroundColor: location.pathname === "/admin" ? "rgba(25, 118, 210, 0.15)" : "rgba(0, 0, 0, 0.04)"
                }
              }}
            >
              Admin
            </Button>
          )}
        </Box>

        {/* Right: User info or login */}
        <Box display="flex" alignItems="center" gap={2}>
          {!user ? (
            <Button onClick={login} color="primary" variant="outlined">
              Login
            </Button>
          ) : (
            <>
              <Button component={RouterLink} to="/profile" color="inherit" sx={{ textTransform: "none" }}>
                <Typography variant="body1" fontWeight="bold" mr={1}>
                  {user.username}
                </Typography>
                <Avatar alt={user.username} src={user.profileImage}>
                  {avatarContent}
                </Avatar>
              </Button>
              <Button onClick={logout} color="error" variant="outlined">
                Logout
              </Button>
            </>
          )}
          <IconButton color="inherit" sx={{ display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
