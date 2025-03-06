import { useState, useEffect } from 'react';
import axios from 'axios';

const CategorySelector = ({ selectedCategories, onChange, showWarning = true }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/categories/');
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Process selectedCategories to ensure they are numbers
  useEffect(() => {
    if (selectedCategories && selectedCategories.length > 0) {
      // Check if we need to process the selected categories
      const needsProcessing = selectedCategories.some(cat => typeof cat !== 'number');
      
      if (needsProcessing) {
        // Convert string IDs to numbers
        const processedCategories = selectedCategories.map(cat => {
          if (typeof cat === 'string') {
            // Try to parse as number
            const parsed = parseInt(cat, 10);
            return isNaN(parsed) ? null : parsed;
          }
          return cat;
        }).filter(id => id !== null);
        
        // Update with processed categories
        onChange(processedCategories);
      }
    }
  }, [selectedCategories, onChange]);

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value, 10);
    let newSelected;
    
    if (e.target.checked) {
      newSelected = [...selectedCategories, categoryId];
    } else {
      newSelected = selectedCategories.filter(id => id !== categoryId);
    }
    
    onChange(newSelected);
  };

  if (loading) return <div className="text-center">Loading categories...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="category-selector">
      <div className="card">
        <div className="card-body">
          <p className="text-muted small mb-2">Select all categories that apply:</p>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {categories.map((category) => (
              <div key={category.id} className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`category-${category.id}`}
                  value={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onChange={handleCategoryChange}
                />
                <label className="form-check-label" htmlFor={`category-${category.id}`}>
                  {category.name}
                </label>
              </div>
            ))}
          </div>
          
          {showWarning && selectedCategories.length === 0 && (
            <div className="alert alert-warning py-2 small">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Selecting at least one category helps users find your content more easily.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
