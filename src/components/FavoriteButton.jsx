import { useState } from "react";
import axios from "axios";
import { getApiUrl } from "../utils/api"; // Import the API utility

const FavoriteButton = ({ recipeId, initialIsFavorited, onFavoriteChange }) => {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async () => {
    setIsLoading(true);

    try {
      // Use getApiUrl instead of hardcoded URL
      const response = await axios.post(getApiUrl("api/favorites/toggle/"), {
        recipe_id: recipeId,
      });

      setIsFavorited(!isFavorited);
      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      if (error.response?.status === 401) {
        alert("Please log in to favorite recipes");
      } else {
        alert("Error updating favorite status");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`btn btn-sm ${
        isFavorited ? "btn-danger" : "btn-outline-danger"
      }`}
      onClick={toggleFavorite}
      disabled={isLoading}
    >
      <i className={`bi ${isFavorited ? "bi-heart-fill" : "bi-heart"}`}></i>{" "}
      {isFavorited ? "Unfavorite" : "Favorite"}
    </button>
  );
};

export default FavoriteButton;
