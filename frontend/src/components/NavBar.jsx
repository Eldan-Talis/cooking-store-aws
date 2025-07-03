import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Avatar, IconButton, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import ChefHat from "../assets/chef.png";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = () => {
    // Add your real login logic here
    const fakeUser = {
      username: "JohnDoe",
      profileImage: "/images/default-avatar.jpg"
    };
    localStorage.setItem("user", JSON.stringify(fakeUser));
    setUser(fakeUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

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

        {/* Center: Nav links */}
        <Box display="flex" gap={2}>
          <Button component={RouterLink} to="/" color="inherit">Home</Button>
          <Button component={RouterLink} to="/favorites" color="inherit">Favorites</Button>
          <Button component={RouterLink} to="/recipes" color="inherit">Recipes</Button>
          <Button component={RouterLink} to="/chat" color="inherit">Chat Bot</Button>
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
                <Avatar alt="Profile" src={user.profileImage} />
              </Button>
              <Button onClick={handleLogout} color="error" variant="outlined">
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
