import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RecipeCard from "../components/RecipeCard";

const MyRecipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const fetchMyRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/recipes/my_recipes/"
      );
      setRecipes(response.data);
    } catch (err) {
      console.error("Error fetching my recipes:", err);
      setError("Error fetching your recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-center">Loading your recipes...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="my-recipes-container">
      <h2 className="mb-4">My Recipes</h2>

      {recipes.length === 0 ? (
        <div className="text-center">
          <p>You haven't created any recipes yet.</p>
          <Link to="/add-recipe" className="btn btn-primary">
            Create Your First Recipe
          </Link>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRecipes;
