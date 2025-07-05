
import { Recipe } from "../API/types";
import { styled } from "@mui/material/styles";
import React, { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Collapse,
  Avatar,
  IconButton,
  Typography,
} from "@mui/material";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";


interface RecipeCardProps {
  recipe: Recipe;
  onFavorite: (recipeId: string) => void; // ✅ required
  isFavorite: boolean;                    // ✅ required
}


interface ExpandMoreProps {
  expand: boolean;
  onClick: () => void;
  children?: ReactNode; // 🔥 חשוב: זה מאפשר שימוש ב-<ExpandMoreIcon />
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
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <Card
  sx={{
    maxWidth: 345,
    display: "flex",
    flexDirection: "column",
    height: "100%", // חשוב לגובה אחיד
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
          minHeight: 56, // גובה קבוע לכותרת
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
  </CardContent>

  <CardActions disableSpacing>
    <IconButton aria-label="add to favorites">
      <FavoriteIcon />
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
      <Typography paragraph>{recipe.Summery}</Typography>
    </CardContent>
  </Collapse>
</Card>

  );
};

