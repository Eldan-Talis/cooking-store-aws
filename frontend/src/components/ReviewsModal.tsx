import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../API/config";


export default function ReviewsModal({ open, onClose, recipeId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) {
      fetch(`${API_BASE}/recipes/${recipeId}/reviews`)
        .then((res) => res.json())
        .then(setReviews);
    }
  }, [open]);

  const handleSubmit = async () => {
    const res = await fetch(`${API_BASE}/recipes/${recipeId}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.idToken}`,
      },
      body: JSON.stringify({
        UserId: user.sub,
        Username: user.username,
        ReviewText: text,
      }),
    });
    if (res.ok) {
      setText("");
      // Option: Push new review manually or refetch
      setReviews((prev) => [...prev, { Username: user.username, ReviewText: text, CreatedAt: new Date().toISOString() }]);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, bgcolor: "#fff", maxWidth: 600, margin: "auto", mt: "10vh" }}>
        <Typography variant="h6">Reviews</Typography>
        {reviews.map((r, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <strong>{r.Username}</strong> ({new Date(r.CreatedAt).toLocaleDateString()}):
            <Typography>{r.ReviewText}</Typography>
          </Box>
        ))}

        {user && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your review..."
            />
            <Button onClick={handleSubmit} sx={{ mt: 1 }} variant="contained">
              Submit
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
}
