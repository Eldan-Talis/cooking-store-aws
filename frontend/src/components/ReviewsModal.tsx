// src/components/ReviewsModal.tsx
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

/* ──────────── types ──────────── */
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

/* ─────────── component ────────── */
export default function ReviewsModal({ open, onClose, recipeId }: Props) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [text, setText] = useState("");

  /* ─── load reviews when opened ─── */
  useEffect(() => {
    if (!open) return;

    fetch(`${API_BASE}/Recipes/${recipeId}/Review`)
      .then((r) => r.json())
      .then((data: Review[]) => {
        setReviews(data);
        if (user) {
          const mine = data.find((r) => r.UserId === user.sub) ?? null;
          setMyReview(mine);
          setText(mine?.ReviewText ?? "");
        }
      })
      .catch((err) => console.error("Failed to load reviews:", err));
  }, [open, recipeId, user]);

  /* ─── create / edit review ─── */
  async function handleSubmit() {
    if (!user || !text.trim()) return;

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

    const updated: Review = {
      UserId: user.sub,
      Username: user.username ?? "anonymous",
      ReviewText: text.trim(),
      CreatedAt: new Date().toISOString(),
    };

    setReviews((prev) =>
      method === "POST"
        ? [...prev, updated]
        : prev.map((r) => (r.UserId === user.sub ? updated : r))
    );
    setMyReview(updated);
    setText("");
  }

  /* ─── render ─── */
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
        {/* title */}
        <Typography variant="h6" gutterBottom>
          Reviews
        </Typography>

        {/* reviews list */}
        {reviews.length === 0 ? (
          <Typography color="text.secondary" mb={2}>
            No reviews yet.
          </Typography>
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

        {/* leave / edit review */}
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

        {/* bottom-right CLOSE button */}
        <Box sx={{ mt: 4, textAlign: "right" }}>
          <Button onClick={onClose}>CLOSE</Button>
        </Box>
      </Box>
    </Modal>
  );
}
