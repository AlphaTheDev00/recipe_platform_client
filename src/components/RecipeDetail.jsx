import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import RatingAndComments from "./RatingAndComments";
import { useAuth } from "../context/AuthContext";
import FavoriteButton from "./FavoriteButton";
import CategoryBadges from "./CategoryBadges";
import { getApiUrl } from "../utils/api"; // Import the API utility

const RecipeDetail = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Function to get placeholder food images based on recipe ID
  const getPlaceholderImage = (recipeId) => {
    // Array of high-quality food placeholder images
    const placeholderImages = [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484980972926-edee96e0960d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1000&auto=format&fit=crop",
    ];

    // Use the recipe ID to select a consistent image for each recipe
    const index = recipeId % placeholderImages.length;
    return placeholderImages[index];
  };

  // Helper function to ensure image URLs are properly formatted
  const getImageUrl = (imageUrl, recipeId) => {
    if (!imageUrl) {
      // If no image, use a placeholder based on recipe ID
      return getPlaceholderImage(recipeId);
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      // If it's already a full URL, use it as is
      return imageUrl;
    }

    if (imageUrl.startsWith("/media/")) {
      // If it's a relative URL from the backend, prepend the API base URL
      return `http://localhost:8000${imageUrl}`;
    }

    // For image_url field which might be a full URL already
    if (recipe.image_url) {
      return recipe.image_url;
    }

    // Fallback to placeholder
    return getPlaceholderImage(recipeId);
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(
          getApiUrl(`api/recipes/${id}/`) // Use getApiUrl instead of hardcoded URL
        );
        setRecipe(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("Error fetching recipe details. Please try again later.");
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        await axios.delete(getApiUrl(`api/recipes/${id}/`)); // Use getApiUrl
        navigate("/recipes");
      } catch (err) {
        setError("Error deleting recipe. Please try again later.");
      }
    }
  };

  if (loading) return <div className="text-center loading">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!recipe)
    return <div className="alert alert-warning">Recipe not found</div>;

  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : "";
  };

  return (
    <div className="container d-flex justify-content-center">
      <div className="recipe-detail">
        <div className="card">
          <img
            src={recipe.image_url || getImageUrl(recipe.image, recipe.id)}
            className="card-img-top"
            alt={recipe.title}
            style={{ maxHeight: "400px", objectFit: "cover" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getPlaceholderImage(recipe.id);
            }}
          />
          <div className="card-body">
            <h2 className="card-title">{recipe.title}</h2>
            <p className="card-text">{recipe.description}</p>

            <div className="mb-4">
              <h4>Ingredients:</h4>
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <ul className="list-group">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="list-group-item">
                      {typeof ingredient === "object" && ingredient !== null
                        ? ingredient.name || JSON.stringify(ingredient)
                        : ingredient}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="alert alert-warning">
                  No ingredients listed for this recipe.
                </p>
              )}
            </div>

            <div className="mb-4">
              <h4>Instructions:</h4>
              <ol className="instructions-list">
                {recipe.instructions
                  .replace(/\\n/g, "\n") // Replace literal \n with actual line breaks
                  .split("\n")
                  .filter((step) => step.trim())
                  .map((step, index) => {
                    // Remove any numbering at the beginning (like "1. ", "2. ")
                    const cleanStep = step.replace(/^\d+\.\s*/, "");
                    return (
                      <li key={index} className="instruction-step">
                        {cleanStep}
                      </li>
                    );
                  })}
              </ol>
            </div>

            <div className="recipe-meta text-muted mb-4">
              <p>Cooking Time: {recipe.cooking_time} minutes</p>
              <p>Servings: {recipe.servings || "4"}</p>
              <p>Difficulty: {capitalizeFirstLetter(recipe.difficulty)}</p>
              <p>Created by: {recipe.author?.username}</p>
              <p className="recipe-rating">
                Rating: <i className="bi bi-star-fill"></i>{" "}
                {recipe.avg_rating
                  ? `${Number(recipe.avg_rating).toFixed(1)}/5`
                  : "No ratings yet"}
              </p>
              <div className="mt-2">
                <CategoryBadges
                  categoryIds={
                    recipe.category_details || recipe.categories || []
                  }
                />
              </div>
            </div>

            {user && recipe.author?.id === user.id && (
              <div className="d-flex justify-content-between mb-4">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/recipes/${id}/edit`)}
                >
                  Edit Recipe
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete Recipe
                </button>
              </div>
            )}

            <div className="recipe-actions mt-3">
              <FavoriteButton
                recipeId={recipe.id}
                initialIsFavorited={recipe.is_favorited}
              />
            </div>
            <div className="recipe-stats mt-2">
              <small className="text-muted">
                <i className="bi bi-heart-fill text-danger"></i>{" "}
                {recipe.favorites_count} favorites
              </small>
            </div>

            {/* Ratings and Comments Section */}
            <RatingAndComments recipeId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
