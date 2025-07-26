// src/components/RecipeCard.tsx
import React, { ReactNode, useEffect, useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReviewsIcon from '@mui/icons-material/Reviews';
import { styled } from "@mui/material/styles";

import { useAuth } from "../context/AuthContext";
import { Recipe } from "../API/types";
import { addToFavorites, removeFavorite } from "../API/favorites";
import ReviewsModal from "./ReviewsModal";

/* ───────────── props ───────────── */
export interface RecipeCardProps {
  recipe: Recipe;
  isFav: boolean;                                           // parent sets this
  onFavToggle: (id: string | number, nowFav: boolean) => void;
}

/* ── helper to strip <b>…</b> etc from summary ── */
const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "");

/* ─── styled expand-icon button ─── */
interface ExpandMoreProps {
  expand: boolean;
  onClick: () => void;
  children?: ReactNode;
}
const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, children, ...other } = props;
  return <IconButton {...other}>{children}</IconButton>;
})(({ theme, expand }) => ({
  marginLeft: "auto",
  transform: expand ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

/* ───────── component ───────── */
export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFav,
  onFavToggle,
}) => {
  const { user } = useAuth();

  /* ---------- local state ---------- */
  const [isFavorite, setIsFavorite] = useState(isFav);
  const [syncingFav, setSyncingFav] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  console.log(`RecipeCard ${recipe.Id} - isFav prop: ${isFav}, isFavorite state: ${isFavorite}`);

  /* keep favourite flag in sync if parent prop changes */
  useEffect(() => {
    console.log(`RecipeCard ${recipe.Id} - useEffect triggered, isFav: ${isFav}`);
    setIsFavorite(isFav);
  }, [isFav, recipe.Id]);

  /* ---------- toggle favourite ---------- */
  const toggleFavorite = async () => {
    if (!user) return alert("You must be logged in to like recipes!");
    if (syncingFav) return;

    const nowFav = !isFavorite;     // what the new state will be
    setIsFavorite(nowFav);          // optimistic UI
    setSyncingFav(true);

    try {
      if (nowFav) await addToFavorites(recipe.Id, user.idToken);
      else        await removeFavorite(recipe.Id, user.idToken);

      /* inform parent so its favourites Set stays consistent */
      onFavToggle(recipe.Id, nowFav);
    } catch (err) {
      console.error(err);
      alert("Could not update favourites – please try again.");
      setIsFavorite(!nowFav);          // rollback UI
    } finally {
      setSyncingFav(false);
    }
  };

  /* ---------- render ---------- */
  return (
    <>
      <Card
        sx={{
          maxWidth: 360,
          borderRadius: 4,
          m: 1,
          boxShadow: 4,
          border: "1px solid #e3f2fd",
          transition: "transform .2s, box-shadow .2s",
          "&:hover": { transform: "translateY(-6px) scale(1.02)", boxShadow: 8 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={recipe.ImageUrl || "/default.jpg"}
          alt={recipe.Title}
          sx={{ objectFit: "cover" }}
        />

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {recipe.Title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {stripHtml(recipe.Summery)}
          </Typography>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 1, justifyContent: "space-between" }}>
          <Box>
            <IconButton
              aria-label="toggle favorite"
              onClick={toggleFavorite}
              disabled={syncingFav}
              color={isFavorite ? "error" : "default"}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>

            {/* Reviews button / modal trigger */}
            <IconButton
              onClick={() => setShowReviews(true)}
              aria-label="reviews"
              color="primary"
            >
              <ReviewsIcon />
            </IconButton>
          </Box>

          <Button
            size="small"
            onClick={() => setShowDetails(true)}
            sx={{ textTransform: "none" }}
            endIcon={<ExpandMoreIcon />}
          >
            Details
          </Button>
        </CardActions>
      </Card>

      {/* ─── Details dialog ─── */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{recipe.Title}</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography paragraph>{stripHtml(recipe.InstructionsText)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Reviews modal (kept as-is) ─── */}
      <ReviewsModal
        open={showReviews}
        onClose={() => setShowReviews(false)}
        recipeId={recipe.Id}
      />
    </>
  );
};
