import { useState, useEffect } from "react";
import axios from "axios";

const RecipeFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    minRating: "",
    maxCookingTime: "",
    difficulty: "",
    categoryId: "",
    searchTerm: "",
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="filter-container mb-4">
      <div className="row g-3">
        <div className="col-md">
          <input
            type="text"
            className="form-control"
            placeholder="Search recipes..."
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleChange}
          />
        </div>
        <div className="col-md">
          <select
            className="form-select"
            name="minRating"
            value={filters.minRating}
            onChange={handleChange}
          >
            <option value="">Minimum Rating</option>
            <option value="1">1+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
        <div className="col-md">
          <select
            className="form-select"
            name="maxCookingTime"
            value={filters.maxCookingTime}
            onChange={handleChange}
          >
            <option value="">Cooking Time</option>
            <option value="15">Under 15 mins</option>
            <option value="30">Under 30 mins</option>
            <option value="60">Under 1 hour</option>
            <option value="120">Under 2 hours</option>
          </select>
        </div>
        <div className="col-md">
          <select
            className="form-select"
            name="difficulty"
            value={filters.difficulty}
            onChange={handleChange}
          >
            <option value="">Difficulty Level</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="col-md">
          <select
            className="form-select"
            name="categoryId"
            value={filters.categoryId}
            onChange={handleChange}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default RecipeFilter;
