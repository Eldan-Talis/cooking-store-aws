import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 6,
          textAlign: "center",
          maxWidth: 500,
          borderRadius: 4,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* 404 Number */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "6rem", md: "8rem" },
            fontWeight: 900,
            color: "primary.main",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            mb: 2,
          }}
        >
          404
        </Typography>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 2,
          }}
        >
          Oops! Page Not Found
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            mb: 4,
            fontSize: "1.1rem",
            lineHeight: 1.6,
          }}
        >
          The page you're looking for doesn't exist or has been moved. 
          Don't worry, let's get you back to cooking!
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1.1rem",
            }}
          >
            Go Home
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1.1rem",
            }}
          >
            Go Back
          </Button>
        </Box>

        {/* Decorative Elements */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "center",
            gap: 1,
          }}
        >
          {["🍳", "🥘", "🍽️", "👨‍🍳"].map((emoji, index) => (
            <Box
              key={index}
              sx={{
                fontSize: "2rem",
                animation: "bounce 2s infinite",
                animationDelay: `${index * 0.2}s`,
                "@keyframes bounce": {
                  "0%, 20%, 50%, 80%, 100%": {
                    transform: "translateY(0)",
                  },
                  "40%": {
                    transform: "translateY(-10px)",
                  },
                  "60%": {
                    transform: "translateY(-5px)",
                  },
                },
              }}
            >
              {emoji}
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
} 