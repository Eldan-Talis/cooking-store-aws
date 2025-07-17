import React, { useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Avatar, IconButton, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import ChefHat from "../assets/chef.png";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, login, logout } = useAuth();


  return (
    <AppBar position="static" color="default" elevation={2}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left: Brand */}
        <Box display="flex" alignItems="center" component={RouterLink} to="/" sx={{ textDecoration: "none" }}>
          <img src={ChefHat} alt="ChefBot logo" style={{ height: 40, marginRight: 8 }} />
          <Typography variant="h6" color="textPrimary">
            ChefBot
          </Typography>
        </Box>

        {/* Center: Navigation Links */}
        <Box display="flex" gap={2}>
          <Button component={RouterLink} to="/" color="inherit">Home</Button>
          <Button component={RouterLink} to="/favorites" color="inherit">Favorites</Button>
          <Button component={RouterLink} to="/recipes" color="inherit">Recipes</Button>
          <Button component={RouterLink} to="/chat" color="inherit">Chat Bot</Button>
        </Box>

        {/* Right: Auth buttons */}
        <Box display="flex" alignItems="center" gap={2}>
          {user && user.username ? (
            <>
              <Button component={RouterLink} to="/profile" color="inherit" sx={{ textTransform: "none" }}>
                <Typography variant="body1" fontWeight="bold" mr={1}>
                  {user.username}
                </Typography>
                <Avatar alt={user.username} src={user.profileImage || undefined} />
              </Button>
              <Button onClick={logout} color="error" variant="outlined">
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={login} color="primary" variant="outlined">
              Login
            </Button>
          )}

          {/* Optional mobile menu icon */}
          <IconButton color="inherit" sx={{ display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
