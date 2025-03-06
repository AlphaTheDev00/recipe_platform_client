import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryBadges = ({ categoryIds, onClick, showLabel = true }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      // Handle empty or invalid categories
      if (!categoryIds || categoryIds.length === 0) {
        setCategories([]);
        setLoading(false);
        return;
      }

      // If categoryIds is already an array of objects with name property, use directly
      if (Array.isArray(categoryIds) && categoryIds.length > 0 && typeof categoryIds[0] === 'object' && categoryIds[0].name) {
        setCategories(categoryIds);
        setLoading(false);
        return;
      }
      
      // Handle string format (like JSON string representation)
      let processedCategoryIds = categoryIds;
      
      // If categoryIds is a string, try to parse it
      if (typeof categoryIds === 'string') {
        try {
          // Check if it's a JSON string
          if (categoryIds.startsWith('[') && categoryIds.endsWith(']')) {
            try {
              // Try to parse as JSON first
              const parsedCategories = JSON.parse(categoryIds);
              if (Array.isArray(parsedCategories)) {
                // If successfully parsed as array, use these values
                processedCategoryIds = parsedCategories;
                
                // If it's an array of strings, convert to objects with name property
                if (parsedCategories.length > 0 && typeof parsedCategories[0] === 'string') {
                  setCategories(parsedCategories.map(name => ({
                    id: name.replace(/"/g, ''), 
                    name: name.replace(/"/g, '')
                  })));
                  setLoading(false);
                  return;
                }
              } else {
                // Fallback to manual parsing
                const cleanString = categoryIds.substring(1, categoryIds.length - 1);
                const categoryNames = cleanString
                  .split(',')
                  .map(item => item.trim().replace(/"/g, ''));
                
                // Just use the category names directly
                setCategories(categoryNames.map(name => ({ id: name, name })));
                setLoading(false);
                return;
              }
            } catch (jsonError) {
              // If JSON parsing fails, do manual parsing
              const cleanString = categoryIds.substring(1, categoryIds.length - 1);
              const categoryNames = cleanString
                .split(',')
                .map(item => item.trim().replace(/"/g, ''));
              
              // Just use the category names directly
              setCategories(categoryNames.map(name => ({ id: name, name })));
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error('Error parsing category string:', e);
        }
      }

      try {
        const response = await axios.get('http://localhost:8000/api/categories/');
        
        // Handle different types of category IDs
        let filteredCategories = [];
        
        if (Array.isArray(processedCategoryIds)) {
          // If we have category IDs as numbers
          filteredCategories = response.data.filter(category => 
            processedCategoryIds.includes(category.id)
          );
          
          // If we didn't find any by ID, try matching by name
          if (filteredCategories.length === 0) {
            const categoryNames = processedCategoryIds.map(c => 
              typeof c === 'object' ? c.name : 
              typeof c === 'string' ? c : String(c)
            );
            
            filteredCategories = response.data.filter(category => 
              categoryNames.includes(category.name)
            );
          }
        }
        
        setCategories(filteredCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, [categoryIds]);

  if (loading) return <div className="small text-muted">Loading categories...</div>;
  
  if (!categories || categories.length === 0) {
    return null; // Don't show anything if no categories
  }

  return (
    <div className="category-badges">
      {showLabel && <span className="small text-muted me-2">Categories:</span>}
      {categories.map((category, index) => {
        // Handle both object and string formats
        const categoryName = typeof category === 'object' ? category.name : category;
        const categoryId = typeof category === 'object' ? category.id : category;
        
        return (
          <span 
            key={categoryId || index} 
            className="badge bg-secondary me-1 mb-1"
            onClick={onClick ? () => onClick(categoryId) : undefined}
            style={onClick ? { cursor: 'pointer' } : {}}
          >
            {categoryName}
          </span>
        );
      })}
    </div>
  );
};

export default CategoryBadges;
