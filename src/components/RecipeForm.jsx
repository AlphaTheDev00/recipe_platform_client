import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import CategorySelector from "./CategorySelector";

const RecipeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: [""],
    instructions: "",
    cooking_time: "",
    servings: "",
    difficulty: "Easy",
    image: null,
    categories: [], // Array of category IDs
  });

  // Track selected category IDs for easier UI management
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);

  // We don't need to fetch categories here anymore as the CategorySelector component will handle it

  useEffect(() => {
    if (isEditing) {
      const fetchRecipe = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8000/api/recipes/${id}/`
          );
          const recipe = response.data;

          // Process categories
          let categoryIds = [];

          // First try to get from category_details (preferred)
          if (
            recipe.category_details &&
            Array.isArray(recipe.category_details)
          ) {
            categoryIds = recipe.category_details.map((cat) => cat.id);
          }
          // If no category_details, try to parse from categories if it's a string
          else if (
            typeof recipe.categories === "string" &&
            recipe.categories.startsWith("[")
          ) {
            try {
              // Try to parse JSON string
              const parsedCategories = JSON.parse(recipe.categories);
              if (Array.isArray(parsedCategories)) {
                // If it's an array of strings (category names), fetch the actual categories
                const categoryResponse = await axios.get(
                  "http://localhost:8000/api/categories/"
                );
                const allCategories = categoryResponse.data;

                // Match category names to IDs
                categoryIds = parsedCategories
                  .map((catName) => {
                    const matchingCat = allCategories.find(
                      (c) => c.name === catName.replace(/"/g, "")
                    );
                    return matchingCat ? matchingCat.id : null;
                  })
                  .filter((id) => id !== null);
              }
            } catch (e) {
              console.error("Error parsing categories:", e);
            }
          }
          // If categories is already an array, use it
          else if (Array.isArray(recipe.categories)) {
            categoryIds = recipe.categories.map((cat) =>
              typeof cat === "object" ? cat.id : cat
            );
          }

          setSelectedCategories(categoryIds);

          // Process ingredients to ensure they are strings
          let ingredientStrings = [""];
          if (recipe.ingredients && recipe.ingredients.length > 0) {
            ingredientStrings = recipe.ingredients.map((ing) =>
              typeof ing === "string" ? ing : ing.name
            );
          }

          setFormData({
            ...recipe,
            ingredients: ingredientStrings,
            categories: categoryIds,
          });

          setLoading(false);
        } catch (err) {
          console.error("Error fetching recipe:", err);
          setError("Error fetching recipe. Please try again.");
          setLoading(false);
        }
      };
      fetchRecipe();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData((prev) => ({
      ...prev,
      ingredients: newIngredients,
    }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        ingredients: newIngredients,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("cooking_time", formData.cooking_time);
      submitData.append("preparation_time", formData.preparation_time || 0);
      submitData.append("difficulty", formData.difficulty.toLowerCase());
      submitData.append("servings", formData.servings);
      submitData.append("instructions", formData.instructions);

      // Format ingredients correctly
      // Filter out empty ingredients and ensure all ingredients are strings
      const cleanIngredients = formData.ingredients
        .filter(
          (ing) => ing && (typeof ing === "string" ? ing.trim() : ing.name)
        )
        .map((ing) => (typeof ing === "string" ? ing : ing.name));

      // Create an array of ingredient objects
      const ingredientObjects = cleanIngredients.map((ing) => ({ name: ing }));

      // Add ingredients as a JSON string
      if (ingredientObjects.length > 0) {
        submitData.append("ingredients", JSON.stringify(ingredientObjects));
      }

      // Convert categories to a simple array of IDs and stringify it
      // Add each category ID as a separate form field entry
      selectedCategories.forEach((categoryId, index) => {
        submitData.append(`categories[${index}]`, categoryId);
      });

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const url = isEditing
        ? `http://localhost:8000/api/recipes/${id}/`
        : "http://localhost:8000/api/recipes/";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Error saving recipe");
      }

      const data = await response.json();
      // Success! Redirect to recipes page
      navigate("/recipes");
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Error saving recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <h2 className="mb-4">
            {isEditing ? "Edit Recipe" : "Add New Recipe"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Ingredients</label>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={ingredient}
                    onChange={(e) =>
                      handleIngredientChange(index, e.target.value)
                    }
                    placeholder="Enter ingredient"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeIngredient(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={addIngredient}
              >
                Add Ingredient
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label">Instructions</label>
              <textarea
                className="form-control"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>

            <div className="row mb-3">
              <div className="col">
                <label className="form-label">Cooking Time (minutes)</label>
                <input
                  type="number"
                  className="form-control"
                  name="cooking_time"
                  value={formData.cooking_time}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col">
                <label className="form-label">Servings</label>
                <input
                  type="number"
                  className="form-control"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-control"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  required
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Image</label>
              <input
                type="file"
                className="form-control"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Categories</label>
              <CategorySelector
                selectedCategories={selectedCategories}
                onChange={(newCategories) => {
                  setSelectedCategories(newCategories);
                  setFormData({ ...formData, categories: newCategories });
                }}
              />
            </div>

            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary">
                {isEditing ? "Update Recipe" : "Create Recipe"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/recipes")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecipeForm;
