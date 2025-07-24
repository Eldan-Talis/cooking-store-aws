import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { Review, useReviewsApi } from "../API/useReviewsApi";

interface Props {
  open: boolean;
  onClose: () => void;
  recipeId: string;
}

export default function ReviewsModal({ open, onClose, recipeId }: Props) {
  const { user } = useAuth();
  const { getReviews, createReview, updateReview } = useReviewsApi();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [text, setText] = useState("");

  /* ─── load list ─── */
  useEffect(() => {
    if (!open) return;

    getReviews(recipeId)
      .then((data) => {
        setReviews(data);
        if (user) {
          const mine = data.find((r) => r.UserId === user.sub) ?? null;
          setMyReview(mine);
          // Only set text if user doesn't have any text typed yet
          if (!text.trim()) {
            setText(mine?.ReviewText ?? "");
          }
        }
      })
      .catch((err) => console.error(err));
  }, [open, recipeId, user?.sub]); // Removed getReviews and user, only depend on user.sub

  /* ─── submit ─── */
  async function handleSubmit() {
    if (!text.trim()) return;
    
    console.log("Submitting review...");
    console.log("User:", user);
    console.log("Recipe ID:", recipeId);
    console.log("Text:", text.trim());
    console.log("Is edit:", !!myReview);

    try {
      if (myReview) {
        console.log("Updating existing review...");
        await updateReview(recipeId, text.trim());
      } else {
        console.log("Creating new review...");
        await createReview(recipeId, text.trim());
      }

      const updated: Review = {
        UserId: user!.sub,
        Username: user!.username,
        ReviewText: text.trim(),
        CreatedAt: new Date().toISOString(),
      };

      setReviews((prev) =>
        myReview
          ? prev.map((r) => (r.UserId === user!.sub ? updated : r))
          : [...prev, updated]
      );
      setMyReview(updated);
      setText("");
    } catch (e) {
      console.error(e);
      alert("Failed to submit review");
    }
  }

  /* ─── UI ─── */
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 4,
          bgcolor: "#fff",
          maxWidth: 600,
          width: "90%",
          mx: "auto",
          mt: "10vh",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Reviews
        </Typography>

        {reviews.length === 0 ? (
          <Typography color="text.secondary">No reviews yet.</Typography>
        ) : (
          reviews.map((r) => (
            <Box key={`${r.UserId}-${r.CreatedAt}`} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <strong>{r.Username}</strong>{" "}
                  <Typography component="span" color="text.secondary">
                    ({new Date(r.CreatedAt).toLocaleDateString()}):
                  </Typography>
                  <Typography>{r.ReviewText}</Typography>
                </Box>
                {user && r.UserId === user.sub && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setMyReview(r);
                      setText(r.ReviewText);
                    }}
                    sx={{ ml: 2, minWidth: 'auto' }}
                  >
                    Edit
                  </Button>
                )}
              </Box>
              <Divider sx={{ mt: 1 }} />
            </Box>
          ))
        )}

        {user && (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your review…"
            />
            <Button
              variant="contained"
              sx={{ mt: 1 }}
              disabled={!text.trim()}
              onClick={handleSubmit}
            >
              {myReview ? "Save changes" : "Submit"}
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 4, textAlign: "right" }}>
          <Button onClick={onClose}>CLOSE</Button>
        </Box>
      </Box>
    </Modal>
  );
}
