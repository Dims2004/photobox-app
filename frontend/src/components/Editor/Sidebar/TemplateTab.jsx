import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaSearch } from "react-icons/fa";
import {
  getTemplates,
  saveFavorite,
  removeFavorite,
} from "../../../services/api";
import { useEditor } from "../../../hooks/useEditor";

const TemplateTab = () => {
  const { setTemplate, setLayout } = useEditor();
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", label: "All" },
    { id: "korean", label: "Korean Style" },
    { id: "vintage", label: "Vintage" },
    { id: "polaroid", label: "Polaroid" },
    { id: "minimalist", label: "Minimalist" },
    { id: "cute", label: "Cute" },
    { id: "floral", label: "Floral" },
    { id: "birthday", label: "Birthday" },
    { id: "wedding", label: "Wedding" },
    { id: "summer", label: "Summer" },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response.data);
      setFilteredTemplates(response.data);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.theme.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleTemplateSelect = (template) => {
    setTemplate(template);
    if (template.layout) {
      setLayout(template.layout);
    }
  };

  const toggleFavorite = async (templateId) => {
    try {
      if (favorites.includes(templateId)) {
        await removeFavorite(templateId);
        setFavorites(favorites.filter((id) => id !== templateId));
      } else {
        await saveFavorite(templateId);
        setFavorites([...favorites, templateId]);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  return (
    <div className="template-tab">
      <div className="template-search">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="template-categories">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="template-grid">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="template-item"
              onClick={() => handleTemplateSelect(template)}
            >
              <div
                className="template-item-preview"
                style={{
                  background: `linear-gradient(135deg, ${template.colors?.[0] || "#8b5cf6"}, ${template.colors?.[1] || "#f43f5e"})`,
                }}
              >
                <button
                  className="favorite-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(template.id);
                  }}
                >
                  {favorites.includes(template.id) ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
                <div className="template-item-overlay">
                  <span className="template-format">{template.layout}</span>
                  <span className="template-frames">
                    {template.frames} photos
                  </span>
                </div>
              </div>
              <div className="template-item-info">
                <h4>{template.name}</h4>
                <span className="template-theme">{template.theme}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateTab;
