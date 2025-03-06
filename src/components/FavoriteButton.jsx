import React, { useState } from "react";
import axios from "axios";

const FavoriteButton = ({
  recipeId,
  initialIsFavorited = false,
  onFavoriteChange,
}) => {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to favorite recipes");
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/api/recipes/${recipeId}/toggle_favorite/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setIsFavorited(response.data.status === "favorited");

      // Call the callback function if provided
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
