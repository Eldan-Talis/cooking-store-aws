import React, { ReactNode, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useAuth } from "../context/AuthContext";
import { Recipe } from "../API/types";
import ReactStars from "react-stars";
import ReviewsModal from "./ReviewsModal";

interface RecipeCardProps {
  recipe: Recipe;
}

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

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(
    recipe.AverageRating ?? 0
  );
  const [showReviews, setShowReviews] = useState(false);

  const API_BASE = "https://qbk52rz2nl.execute-api.us-east-1.amazonaws.com/dev";

  useEffect(() => {
    if (recipe.MyRating) {
      setUserRating(recipe.MyRating);
    } else if (user && recipe.Id) {
      fetch(`${API_BASE}/recipes/${recipe.Id}/my-rating?userId=${user.sub}`, {
        headers: { Authorization: `Bearer ${user.idToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.Rating) {
            setUserRating(data.Rating);
          }
        })
        .catch(() => setUserRating(0));
    } else {
      setUserRating(0);
    }

    // ✅ Initialize average rating too:
    setAverageRating(recipe.AverageRating ?? 0);
  }, [recipe, user]);

  const handleExpandClick = () => setExpanded((prev) => !prev);

  const handleRate = async (newRating: number) => {
    if (!user) {
      alert("You must be logged in to rate!");
      return;
    }

    setUserRating(newRating);

    try {
      const response = await fetch(`${API_BASE}/recipes/${recipe.Id}/rating`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({
          UserId: user.sub,
          Rating: newRating,
        }),
      });

      if (!response.ok) throw new Error("Failed to save rating");

      const text = await response.text();
      console.log("PUT result:", text);

      const match = text.match(/New average:\s([\d\.]+)/);
      if (match) {
        const newAvg = parseFloat(match[1]);
        setAverageRating(newAvg); // ✅ React state = re-render!
      }
    } catch (err) {
      console.error("Failed to save rating:", err);
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 345,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <CardHeader
        action={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
        title={
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minHeight: 56,
            }}
          >
            {recipe.Title}
          </Typography>
        }
      />

      <CardMedia
        component="img"
        height="194"
        image={recipe.ImageUrl || "/default.jpg"}
        alt={recipe.Title}
      />

      <CardContent sx={{ minHeight: 72, flexGrow: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {recipe.Summery}
        </Typography>

        {/* ✅ Local average */}
        <Typography
          variant="body2"
          color="text.primary"
          sx={{ mt: 1, fontWeight: 500 }}
        >
          ⭐ {averageRating.toFixed(1)} / 5
        </Typography>

        <ReactStars
          count={5}
          value={userRating}
          onChange={handleRate}
          size={24}
          half={false}
          color2={"#ffd700"}
        />
      </CardContent>

      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton
          aria-label="show reviews"
          onClick={() => setShowReviews(true)}
        >
          🗨️{" "}
          {/* or use an actual icon like <CommentIcon /> if using MUI Icons */}
        </IconButton>

        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>Description:</Typography>
          <Typography paragraph>{recipe.InstructionsText}</Typography>
        </CardContent>
      </Collapse>
      <ReviewsModal
        open={showReviews}
        onClose={() => setShowReviews(false)}
        recipeId={recipe.Id}
      />
    </Card>
  );
};
