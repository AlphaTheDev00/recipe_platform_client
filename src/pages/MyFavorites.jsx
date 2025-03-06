import React, { useState, useEffect } from "react";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";

const MyFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://localhost:8000/api/users/my_favorites/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setFavorites(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setError(error.response?.data?.message || "Failed to fetch favorites");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container my-4">
      <h2 className="mb-4">My Favorite Recipes</h2>
      {favorites.length === 0 ? (
        <div className="alert alert-info">
          You haven't favorited any recipes yet.
          <br />
          <a href="/recipes" className="alert-link">
            Browse recipes
          </a>{" "}
          to add some to your favorites!
        </div>
      ) : (
        <div className="row">
          {favorites.map((recipe) => (
            <div key={recipe.id} className="col">
              <RecipeCard
                recipe={recipe}
                onFavoriteChange={fetchFavorites}
                showFavoriteButton={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFavorites;
