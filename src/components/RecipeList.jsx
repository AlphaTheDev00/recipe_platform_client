import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RecipeFilter from "./RecipeFilter";
import Pagination from "./Pagination";

const RecipeList = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [recipesPerPage] = useState(12);
  const [filters, setFilters] = useState({
    minRating: "",
    maxCookingTime: "",
    difficulty: "",
    categoryId: "",
    searchTerm: "",
  });

  // Helper function to ensure image URLs are properly formatted
  const getImageUrl = (imageUrl, recipeId) => {
    // First try to use the image_url field which should be a full URL
    if (imageUrl && imageUrl.startsWith("http://localhost:8001/media/")) {
      return imageUrl;
    }

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

    // Fallback to placeholder
    return getPlaceholderImage(recipeId);
  };

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

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    fetchRecipes();
    // Reset to first page when tab or filters change
    setCurrentPage(1);
  }, [activeTab, filters, user]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = "/api/recipes/";

      switch (activeTab) {
        case "my_recipes":
          endpoint = "/api/recipes/my_recipes/";
          break;
        case "top_rated":
          endpoint = "/api/recipes/top_rated/";
          break;
        case "recent":
          endpoint = "/api/recipes/recent/";
          break;
        case "trending":
          endpoint = "/api/recipes/trending/";
          break;
        case "recommendations":
          endpoint = "/api/recipes/recommendations/";
          break;
        default:
          endpoint = "/api/recipes/";
      }

      // Add query parameters for filters
      const params = new URLSearchParams();
      if (filters.minRating) params.append("min_rating", filters.minRating);
      if (filters.maxCookingTime)
        params.append("max_cooking_time", filters.maxCookingTime);
      if (filters.difficulty) params.append("difficulty", filters.difficulty);
      if (filters.categoryId) params.append("category_id", filters.categoryId);
      if (filters.searchTerm) params.append("search", filters.searchTerm);

      const queryString = params.toString();
      const url = `http://localhost:8000${endpoint}${
        queryString ? "?" + queryString : ""
      }`;

      const response = await axios.get(url);
      setRecipes(response.data);
    } catch (err) {
      setError("Error fetching recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const renderRecipeCard = (recipe) => (
    <div key={recipe.id} className="recipe-card">
      <div className="card">
        <img
          src={recipe.image_url || getImageUrl(recipe.image, recipe.id)}
          className="card-img-top"
          alt={recipe.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getPlaceholderImage(recipe.id);
          }}
        />
        <div className="card-body">
          <h5 className="card-title">{recipe.title}</h5>
          <p className="card-text">
            {recipe.description
              ? recipe.description.split("...")[0]
              : "No description available"}
          </p>

          <div className="recipe-info">
            <div className="recipe-info-item">
              <i className="bi bi-clock"></i>
              <span>
                {recipe.cooking_time ? `${recipe.cooking_time} min` : "N/A"}
              </span>
            </div>
            <div className="recipe-info-item">
              <i className="bi bi-people"></i>
              <span>{recipe.servings || "4"} servings</span>
            </div>
            <div className="recipe-info-item">
              <i className="bi bi-bar-chart"></i>
              <span>
                {recipe.difficulty
                  ? capitalizeFirstLetter(recipe.difficulty)
                  : "Medium"}
              </span>
            </div>
          </div>

          <div className="card-content-bottom">
            <div className="rating">
              <i className="bi bi-star-fill"></i>
              <span>
                {recipe.avg_rating
                  ? `${Number(recipe.avg_rating).toFixed(1)}/5`
                  : "No ratings yet"}
              </span>
            </div>

            <Link to={`/recipes/${recipe.id}`} className="btn btn-primary">
              View Recipe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="recipe-list-container">
      <div className="tabs-container">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Recipes
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "top_rated" ? "active" : ""
              }`}
              onClick={() => setActiveTab("top_rated")}
            >
              Top Rated
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "recent" ? "active" : ""}`}
              onClick={() => setActiveTab("recent")}
            >
              Recently Added
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "trending" ? "active" : ""}`}
              onClick={() => setActiveTab("trending")}
            >
              Trending
            </button>
          </li>
          {user && (
            <>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "my_recipes" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("my_recipes")}
                >
                  My Recipes
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "recommendations" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("recommendations")}
                >
                  Recommended
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      <RecipeFilter onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <div className="recipe-grid">
            {recipes.length === 0 ? (
              <div className="no-recipes">
                <p className="text-center text-muted">No recipes found.</p>
              </div>
            ) : (
              // Get current recipes for pagination
              recipes
                .slice(
                  (currentPage - 1) * recipesPerPage,
                  currentPage * recipesPerPage
                )
                .map((recipe) => renderRecipeCard(recipe))
            )}
          </div>

          {/* Pagination */}
          {recipes.length > recipesPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(recipes.length / recipesPerPage)}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RecipeList;
