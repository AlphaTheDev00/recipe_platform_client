// API utility optimized for local development

import memoryStorage from "./memoryStorage";
import config from './config';

// Use API URL from config
export const API_BASE_URL = config.API_URL;

/**
 * Get full API URL for a given endpoint
 * @param {string} endpoint - The API endpoint path (without leading slash)
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  // Handle undefined or null endpoint
  if (endpoint === undefined || endpoint === null) {
    return API_BASE_URL;
  }

  // Safely handle string operations
  const path =
    typeof endpoint === "string" && endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
  const fullUrl = `${API_BASE_URL}${path}`;
  console.log("Generated API URL:", fullUrl);
  return fullUrl;
};

// Set to false for local development
let forceOfflineMode = false;

// Disable caching for local development for easier debugging
const DISABLE_ALL_CACHING = true;

// API status check optimized for local development
export const checkApiStatus = async () => {
  if (forceOfflineMode) {
    console.log("Forcing offline mode due to API unavailability");
    return false;
  }

  try {
    // Use health check endpoint for local development
    const response = await fetch(`${API_BASE_URL}/api/health/`, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      console.log("API is available");
      return true;
    } else {
      console.warn("API returned non-OK status:", response.status);
      return false;
    }
  } catch (error) {
    console.error("API status check failed:", error);
    return false;
  }
};

/**
 * Enhanced fetch helper with better error handling for local development
 * @param {string} endpoint - API endpoint to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Parsed response data
 */
export const safeFetch = async (endpoint, options = {}) => {
  // Add helpful debug log for local development
  console.log(`Fetching from endpoint: ${endpoint}`);
  
  // Check if API is available
  const isApiAvailable = await checkApiStatus();
  
  if (!isApiAvailable) {
    console.warn(`API unavailable, using mock data for: ${endpoint}`);
    return getMockData(endpoint);
  }

  // Prepare fetch options with defaults
  const fetchOptions = {
    method: options.method || "GET",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Add body if provided
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(getApiUrl(endpoint), fetchOptions);
    
    // Log detailed response info for debugging
    console.log(`Response status for ${endpoint}:`, response.status);
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    // Handle empty responses
    if (response.status === 204) {
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return getMockData(endpoint);
  }
};

/**
 * Clear all caches related to API data
 */
export const clearCaches = () => {
  // Clear localStorage cache
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("api_cache_")) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
  
  // Clear memory cache
  memoryStorage.clear();
  
  console.log("All API caches cleared");
};

/**
 * Force refresh data from API, bypassing all caches
 * @param {string} endpoint - API endpoint to fetch
 * @returns {Promise<any>} - Fresh data from API
 */
export const forceRefresh = async (endpoint) => {
  console.log(`Force refreshing data from: ${endpoint}`);
  
  // Clear specific endpoint cache
  const cacheKey = `api_cache_${endpoint}`;
  localStorage.removeItem(cacheKey);
  memoryStorage.remove(cacheKey);
  
  // Fetch fresh data
  return safeFetch(endpoint);
};

/**
 * Get mock data for when API is unavailable
 * @param {string} endpoint - API endpoint
 * @returns {any} - Mock data for the endpoint
 */
export const getMockData = (endpoint) => {
  console.log(`Generating mock data for: ${endpoint}`);
  
  // Basic mock recipes
  const mockRecipes = [
    {
      id: 1,
      title: "Savory Tacos",
      description: "Delicious homemade tacos with fresh ingredients and authentic flavors. Perfect for a family dinner or entertaining guests.",
      cooking_time: 30,
      servings: 4,
      difficulty: "medium",
      image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop",
      avg_rating: 4.7,
      created_at: "2023-05-15T14:22:33Z",
      updated_at: "2023-05-15T14:22:33Z",
      author: {
        id: 1,
        username: "chef_maria",
      },
    },
    {
      id: 2,
      title: "Mock Recipe: Pasta Carbonara",
      description: "Classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.",
      cooking_time: 25,
      servings: 2,
      difficulty: "easy",
      image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
      avg_rating: 4.5,
      created_at: "2023-06-20T10:15:22Z",
      updated_at: "2023-06-20T10:15:22Z",
      author: {
        id: 2,
        username: "italian_chef",
      },
    },
    {
      id: 3,
      title: "Mock Recipe: Vegetable Curry",
      description: "Spicy vegetable curry with coconut milk and aromatic spices.",
      cooking_time: 40,
      servings: 4,
      difficulty: "medium",
      image_url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000&auto=format&fit=crop",
      avg_rating: 4.3,
      created_at: "2023-07-05T16:30:45Z",
      updated_at: "2023-07-05T16:30:45Z",
      author: {
        id: 3,
        username: "spice_master",
      },
    },
    {
      id: 4,
      title: "Mock Recipe: Chocolate Cake",
      description: "Rich and moist chocolate cake with ganache frosting.",
      cooking_time: 60,
      servings: 8,
      difficulty: "medium",
      image_url: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1000&auto=format&fit=crop",
      avg_rating: 4.9,
      created_at: "2023-08-12T09:45:30Z",
      updated_at: "2023-08-12T09:45:30Z",
      author: {
        id: 4,
        username: "dessert_queen",
      },
    },
    {
      id: 5,
      title: "Mock Recipe: Grilled Salmon",
      description: "Perfectly grilled salmon with lemon and herbs.",
      cooking_time: 20,
      servings: 2,
      difficulty: "easy",
      image_url: "https://images.unsplash.com/photo-1484980972926-edee96e0960d?q=80&w=1000&auto=format&fit=crop",
      avg_rating: 4.6,
      created_at: "2023-09-03T18:20:15Z",
      updated_at: "2023-09-03T18:20:15Z",
      author: {
        id: 5,
        username: "seafood_lover",
      },
    },
  ];

  // Return appropriate mock data based on endpoint
  if (endpoint.includes("recipes")) {
    if (endpoint.includes("my_recipes")) {
      return mockRecipes.slice(0, 2);
    } else if (endpoint.includes("top_rated")) {
      return mockRecipes.sort((a, b) => b.avg_rating - a.avg_rating);
    } else if (endpoint.includes("recent")) {
      return mockRecipes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      return mockRecipes;
    }
  }
  
  // Mock categories
  if (endpoint.includes("categories")) {
    return [
      { id: 1, name: "Italian", description: "Italian cuisine" },
      { id: 2, name: "Mexican", description: "Mexican cuisine" },
      { id: 3, name: "Asian", description: "Asian cuisine" },
      { id: 4, name: "Desserts", description: "Sweet treats" },
    ];
  }
  
  // Mock user data
  if (endpoint.includes("users") || endpoint.includes("profile")) {
    return {
      id: 1,
      username: "demo_user",
      email: "demo@example.com",
      first_name: "Demo",
      last_name: "User",
    };
  }
  
  // Default empty response
  return [];
};

export default getApiUrl;
