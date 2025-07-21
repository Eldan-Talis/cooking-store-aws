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
import { API_BASE } from "../API/config";

/** One review object as returned by the API */
export interface Review {
  UserId: string;
  Username: string;
  ReviewText: string;
  CreatedAt: string; // ISO-8601
}

interface Props {
  open: boolean;
  onClose: () => void;
  recipeId: string;
}

export default function ReviewsModal({ open, onClose, recipeId }: Props) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [text, setText] = useState("");

  /** ------------------------------------------------------------------
   *  Load reviews when the modal opens
   *  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!open) return;

    fetch(`${API_BASE}/Recipes/${recipeId}/Review`)
      .then((res) => res.json())
      .then((data: Review[]) => {
        setReviews(data);

        if (user) {
          const mine = data.find((r) => r.UserId === user.sub) ?? null;
          setMyReview(mine);
          setText(mine?.ReviewText ?? ""); // preload text field for editing
        }
      })
      .catch((err) => console.error("Failed to load reviews", err));
  }, [open, recipeId, user]);

  /** ------------------------------------------------------------------
   *  POST (create) or PUT (edit) depending on whether I already reviewed
   *  ------------------------------------------------------------------ */
  async function handleSubmit() {
    if (!user) return; // should never happen (button hidden)
    if (!text.trim()) return; // basic validation

    const method = myReview ? "PUT" : "POST";

    const res = await fetch(
      `${API_BASE}/Recipes/${recipeId}/Review`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({ ReviewText: text.trim() }),
      }
    );

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    const nowIso = new Date().toISOString();
    const updated: Review = {
      UserId: user.sub,
      Username: user.username ?? "anonymous",
      ReviewText: text.trim(),
      CreatedAt: nowIso,
    };

    if (method === "POST") {
      setReviews((prev) => [...prev, updated]);
    } else {
      setReviews((prev) =>
        prev.map((r) => (r.UserId === user.sub ? updated : r))
      );
    }

    setMyReview(updated);
    setText("");
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 4,
          bgcolor: "#fff",
          maxWidth: 600,
          margin: "auto",
          mt: "10vh",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Reviews
        </Typography>

        {reviews.length === 0 && (
          <Typography color="text.secondary" mb={2}>
            No reviews yet.
          </Typography>
        )}

        {reviews.map((r) => (
          <Box key={`${r.UserId}-${r.CreatedAt}`} sx={{ mb: 2 }}>
            <strong>{r.Username}</strong>{" "}
            <Typography component="span" color="text.secondary">
              ({new Date(r.CreatedAt).toLocaleDateString()}):
            </Typography>
            <Typography>{r.ReviewText}</Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}

        {user && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {myReview ? "Edit your review" : "Leave a review"}
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your review..."
            />
            <Button
              onClick={handleSubmit}
              sx={{ mt: 1 }}
              variant="contained"
              disabled={!text.trim()}
            >
              {myReview ? "Save changes" : "Submit"}
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
}
