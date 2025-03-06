import React from "react";
import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";
import CategoryBadges from "./CategoryBadges";

const RecipeCard = ({
  recipe,
  onFavoriteChange,
  showFavoriteButton = true,
}) => {
  // Function to get placeholder food images based on recipe ID
  const getPlaceholderImage = (recipeId) => {
    // Array of high-quality food placeholder images
    const placeholderImages = [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1000&auto=format&fit=crop",
    ];

    // Use recipe ID to consistently select the same placeholder for a given recipe
    return placeholderImages[recipeId % placeholderImages.length];
  };

  // Helper function to get the correct image URL
  const getImageUrl = () => {
    // First try to use the image_url field which should be a full URL
    if (recipe.image_url) {
      return recipe.image_url;
    }

    // Check various possible image property names
    const imageUrl = recipe.image || recipe.imageUrl;

    if (!imageUrl) {
      return getPlaceholderImage(recipe.id);
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/media/")) {
      return `http://localhost:8000${imageUrl}`;
    }

    return getPlaceholderImage(recipe.id);
  };

  return (
    <div className="card h-100">
      <img
        src={getImageUrl()}
        className="card-img-top"
        alt={recipe.title}
        style={{ height: "200px", objectFit: "cover" }}
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop
          e.target.src = getPlaceholderImage(recipe.id);
        }}
      />
      <div className="card-body">
        <h5 className="card-title">{recipe.title}</h5>
        <p className="card-text">{recipe.description}</p>
        <div className="mb-2">
          <CategoryBadges
            categoryIds={recipe.category_details || recipe.categories || []}
            showLabel={false}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <Link to={`/recipes/${recipe.id}`} className="btn btn-primary">
            View Recipe
          </Link>
          {showFavoriteButton && (
            <FavoriteButton
              recipeId={recipe.id}
              initialIsFavorited={recipe.is_favorited}
              onFavoriteChange={onFavoriteChange}
            />
          )}
        </div>
      </div>
      <div className="card-footer text-muted">
        <small>
          <i className="bi bi-star-fill text-warning"></i>
          {recipe.avg_rating
            ? ` ${Number(recipe.avg_rating).toFixed(1)}/5`
            : " No ratings"}
          {" · "}
          <i className="bi bi-heart-fill text-danger"></i>{" "}
          {recipe.favorites_count || 0}
        </small>
      </div>
    </div>
  );
};

export default RecipeCard;
