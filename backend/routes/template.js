const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const router = express.Router();

// Sample template data
const TEMPLATES = [
  {
    id: "template-1",
    name: "Korean Style A",
    category: "korean",
    theme: "Korean Style",
    preview: "/assets/templates/korean-style-a.jpg",
    layout: "2x2",
    frames: 4,
    colors: ["#FFE5D9", "#FFD6C2", "#FFC7B0"],
  },
  {
    id: "template-2",
    name: "Vintage Classic",
    category: "vintage",
    theme: "Vintage",
    preview: "/assets/templates/vintage-classic.jpg",
    layout: "3x2",
    frames: 6,
    colors: ["#D4B895", "#C4A882", "#B89B7A"],
  },
  {
    id: "template-3",
    name: "Polaroid Style",
    category: "polaroid",
    theme: "Polaroid",
    preview: "/assets/templates/polaroid-style.jpg",
    layout: "2x1",
    frames: 2,
    colors: ["#F5F5F5", "#EDEDED", "#E0E0E0"],
  },
  {
    id: "template-4",
    name: "Minimalist Modern",
    category: "minimalist",
    theme: "Minimalist",
    preview: "/assets/templates/minimalist-modern.jpg",
    layout: "3x3",
    frames: 9,
    colors: ["#FFFFFF", "#F0F0F0", "#E8E8E8"],
  },
  {
    id: "template-5",
    name: "Cute Pastel",
    category: "cute",
    theme: "Cute",
    preview: "/assets/templates/cute-pastel.jpg",
    layout: "2x2",
    frames: 4,
    colors: ["#FFB7C5", "#FFC8D6", "#FFD9E6"],
  },
  {
    id: "template-6",
    name: "Floral Garden",
    category: "floral",
    theme: "Floral",
    preview: "/assets/templates/floral-garden.jpg",
    layout: "3x2",
    frames: 6,
    colors: ["#F7D6E0", "#F2E5D5", "#E8D5C4"],
  },
  {
    id: "template-7",
    name: "Birthday Celebration",
    category: "birthday",
    theme: "Birthday",
    preview: "/assets/templates/birthday-celebration.jpg",
    layout: "2x3",
    frames: 6,
    colors: ["#FFE5B4", "#FFD700", "#FFC107"],
  },
  {
    id: "template-8",
    name: "Wedding Elegance",
    category: "wedding",
    theme: "Wedding",
    preview: "/assets/templates/wedding-elegance.jpg",
    layout: "2x2",
    frames: 4,
    colors: ["#F8F0E3", "#F0E6D8", "#E8DCCC"],
  },
  {
    id: "template-9",
    name: "Summer Vibes",
    category: "summer",
    theme: "Summer",
    preview: "/assets/templates/summer-vibes.jpg",
    layout: "3x3",
    frames: 9,
    colors: ["#FFE5B4", "#FFD700", "#FFD93D"],
  },
];

// Get all templates
router.get("/", (req, res) => {
  try {
    res.json({
      success: true,
      data: TEMPLATES,
    });
  } catch (error) {
    console.error("Get templates error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch templates",
        error: error.message,
      });
  }
});

// Get template by ID
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const template = TEMPLATES.find((t) => t.id === id);

    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Get template error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch template",
        error: error.message,
      });
  }
});

// Get templates by category
router.get("/category/:category", (req, res) => {
  try {
    const { category } = req.params;
    const templates = TEMPLATES.filter((t) => t.category === category);

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Get templates by category error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch templates",
        error: error.message,
      });
  }
});

// Get templates by theme
router.get("/theme/:theme", (req, res) => {
  try {
    const { theme } = req.params;
    const templates = TEMPLATES.filter((t) =>
      t.theme.toLowerCase().includes(theme.toLowerCase()),
    );

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Get templates by theme error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch templates",
        error: error.message,
      });
  }
});

// Save favorite template
router.post("/favorite/:id", (req, res) => {
  try {
    const { id } = req.params;
    const template = TEMPLATES.find((t) => t.id === id);

    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    // In production, save to database
    res.json({
      success: true,
      message: "Template added to favorites",
      data: template,
    });
  } catch (error) {
    console.error("Save favorite error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to save favorite",
        error: error.message,
      });
  }
});

// Remove favorite template
router.delete("/favorite/:id", (req, res) => {
  try {
    const { id } = req.params;

    // In production, remove from database
    res.json({
      success: true,
      message: "Template removed from favorites",
    });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to remove favorite",
        error: error.message,
      });
  }
});

module.exports = router;
