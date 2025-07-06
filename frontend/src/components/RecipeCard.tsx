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
import FavoriteIcon     from "@mui/icons-material/Favorite";
import ExpandMoreIcon   from "@mui/icons-material/ExpandMore";
import MoreVertIcon     from "@mui/icons-material/MoreVert";

/* ---------- props ---------- */
interface RecipeCardProps {
  recipe: Recipe;
  onFavorite: (recipeId: string) => void;
  isFavorite: boolean;
}

/* ---------- styled expand btn ---------- */
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

/* ---------- component ---------- */
export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onFavorite,
  isFavorite,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card sx={{ maxWidth: 345, display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader
        action={<IconButton><MoreVertIcon /></IconButton>}
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
      </CardContent>

      <CardActions disableSpacing>
        {/* ----- HEART BUTTON ----- */}
        <IconButton
          aria-label={isFavorite ? "remove from favorites" : "add to favorites"}
          onClick={() => onFavorite(recipe.Id)}
        >
          {/* “error” is the built-in red palette in MUI */}
          <FavoriteIcon color={isFavorite ? "error" : "inherit"} />
        </IconButton>

        <ExpandMore
          expand={expanded}
          onClick={() => setExpanded((prev) => !prev)}
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
