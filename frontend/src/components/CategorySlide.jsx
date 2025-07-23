import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Avatar,
  Typography,
  Badge,
  useTheme,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export default function CategorySelectMUI({
  categories,
  selectedCategoryId,
  onSelectCategory,
  categoryCounts,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const theme = useTheme();

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  const scroll = (offset) => {
    scrollRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const renderCategoryItem = (cat) => {
    const isSelected = selectedCategoryId === cat.Id;

    return (
      <Box
        key={cat.Id}
        onClick={() => onSelectCategory(cat.Id)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mx: 1,
          cursor: "pointer",
        }}
      >
        <Badge
          badgeContent={isSelected ? categoryCounts[cat.Id] : null}
          color="primary"
          overlap="circular"
        >
          <Avatar
            src={cat.ImageUrl}
            alt={cat.Name}
            sx={{
              width: 74,
              height: 74,
              border: isSelected ? `2px solid ${theme.palette.primary.main}` : "none",
            }}
          />
        </Badge>
        <Typography
          variant="caption"
          sx={{ mt: 1, fontWeight: 500, color: theme.palette.text.primary }}
        >
          {cat.Name}
        </Typography>
      </Box>
    );
  };

  return (
    <Box position="relative" sx={{
      overflowX: "auto",
      display: "flex",
      justifyContent: "center",
      px: 5,
      scrollBehavior: "smooth",
      "&::-webkit-scrollbar": { display: "none" },
    }} mt={3} mb={2} px={2}>
      {/* Left Arrow */}
      {canScrollLeft && (
        <IconButton
          onClick={() => scroll(-200)}
          sx={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 1 }}
        >
          <ChevronLeft />
        </IconButton>
      )}

      {/* Scrollable container */}
      <Box
        ref={scrollRef}
        sx={{
          overflowX: "auto",
          display: "flex",
          px: 5,
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {/* All button */}
        <Box
          onClick={() => onSelectCategory(null)}
          sx={{ display: "flex", flexDirection: "column", alignItems: "center", mx: 1, cursor: "pointer" }}
        >
          <Badge
            badgeContent={
              selectedCategoryId === null
                ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
                : null
            }
            color="primary"
            overlap="circular"
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "grey.400",
                fontWeight: "bold",
                fontSize: 18,
                border: selectedCategoryId === null ? `2px solid ${theme.palette.primary.main}` : "none",
              }}
            >
              All
            </Avatar>
          </Badge>
          <Typography
            variant="caption"
            sx={{ mt: 1, fontWeight: 500, color: theme.palette.text.primary }}
          >
            All
          </Typography>
        </Box>

        {/* Categories */}
        {categories.map(renderCategoryItem)}
      </Box>

      {/* Right Arrow */}
      {canScrollRight && (
        <IconButton
          onClick={() => scroll(200)}
          sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", zIndex: 1 }}
        >
          <ChevronRight />
        </IconButton>
      )}
    </Box>
  );
}
