// src/components/RecipeCard.tsx
import React, { ReactNode, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

import { useAuth } from "../context/AuthContext";
import { Recipe } from "../API/types";
import ReviewsModal from "./ReviewsModal";
import { addToFavorites } from "../API/getRecipes";

// REST helpers
import { addFavorite, removeFavorite } from "../API/favorites";

/* ───────────────────────── types ───────────────────────── */
export interface RecipeCardProps {
  recipe: Recipe;
  isFav: boolean;                                           // ← passed from parent
  onFavToggle: (id: string | number, nowFav: boolean) => void;
}

interface ExpandMoreProps {
  expand: boolean;
  onClick: () => void;
  children?: ReactNode;
}

/* ─────────────────── styled expand button ─────────────── */
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

/* ───────────────────── component ──────────────────────── */
export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFav,
  onFavToggle,
}) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(
    recipe.AverageRating ?? 0
  );
  const [showReviews, setShowReviews] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);

  /* favourite state mirrors prop */
  const [syncingFav, setSyncingFav] = useState(false);

  /* ─── keep local favourite in sync when parent changes ── */
  useEffect(() => setIsFavorite(isFav), [isFav]);

  /* ─── bootstrap rating (unchanged logic) ─────────────── */
  useEffect(() => {
    if (recipe.MyRating) {
      setUserRating(recipe.MyRating);
    } else if (user && recipe.Id) {
      fetch(
        `https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Recipes/${recipe.Id}/Rating`,
        { headers: { Authorization: `Bearer ${user.idToken}` } }
      )
        .then((r) => r.json())
        .then((d) => d?.Rating && setUserRating(d.Rating))
        .catch(() => setUserRating(0));
    } else {
      setUserRating(0);
    }

    setAverageRating(recipe.AverageRating ?? 0);
  }, [recipe, user]);

  const handleAddToFavorites = async () => {
    if (!user) {
      alert("You must be logged in to add recipes to favorites!");
      return;
    }

    setIsAddingToFavorites(true);
    try {
      await addToFavorites(recipe.Id, user.idToken);
      setIsFavorite(true);
      alert("Recipe added to favorites!");
    } catch (error) {
      console.error("Failed to add to favorites:", error);
      alert("Failed to add recipe to favorites. Please try again.");
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  const handleRate = async (newRating: number) => {
    if (!user) return alert("You must be logged in to rate!");
    setUserRating(newRating);

    try {
      console.log(user.idToken)
      const res = await fetch(
        `https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Recipes/${recipe.Id}/Rating`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.idToken}`,
          },
          body: JSON.stringify({ UserId: user.sub, Rating: newRating }),
        }
      );
      if (!res.ok) throw new Error(await res.text());

      const txt = await res.text();
      const m = txt.match(/New average:\s([\d.]+)/);
      if (m) setAverageRating(parseFloat(m[1]));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = async () => {
    if (!user) return alert("You must be logged in to like recipes!");
    if (syncingFav) return;

    const nowFav = !isFavorite;
    setIsFavorite(nowFav);             // optimistic UI
    setSyncingFav(true);

    try {
      if (nowFav) await addFavorite(recipe.Id);
      else        await removeFavorite(recipe.Id);

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

  function stripHtml(html) {
    return html.replace(/<[^>]+>/g, "");
  }

  /* ─── UI ─────────────────────────────────────────────── */
  return (
    <Card
      sx={{
        maxWidth: 360,
        borderRadius: 4,
        boxShadow: 4,
        border: "1px solid #e3f2fd",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-6px) scale(1.02)",
          boxShadow: 8,
          borderColor: "#90caf9",
        },
        background: "#fff",
        m: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={recipe.ImageUrl || "/default.jpg"}
        alt={recipe.Title}
        sx={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          objectFit: "cover",
          background: "#f5f5f5",
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#1976d2",
            mb: 1,
            minHeight: 56,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
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
            textOverflow: "ellipsis",
            mb: 1,
          }}
        >
          {stripHtml(recipe.Summery)}
        </Typography>
        {/* You can add more info here, e.g. time, servings, etc. */}
      </CardContent>
      <CardActions disableSpacing sx={{ px: 2, pb: 1, justifyContent: "space-between" }}>
        <Box>
          <IconButton
            aria-label="add to favorites"
            onClick={handleAddToFavorites}
            disabled={isAddingToFavorites}
            color={isFavorite ? "error" : "default"}
          >
            <FavoriteIcon />
          </IconButton>
          <IconButton onClick={() => setShowReviews(true)} aria-label="reviews" color="primary">
            🗨️
          </IconButton>
        </Box>
        <Button
          size="small"
          onClick={() => setShowDescription(true)}
          sx={{
            color: "#1976d2",
            fontWeight: 600,
            textTransform: "none",
          }}
          endIcon={<ExpandMoreIcon />}
        >
          Details
        </Button>
      </CardActions>
      <Dialog
        open={showDescription}
        onClose={() => setShowDescription(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {recipe.Title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography paragraph>
            {stripHtml(recipe.InstructionsText)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDescription(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
