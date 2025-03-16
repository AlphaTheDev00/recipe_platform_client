// API utility with enhanced error handling and fixed safety checks

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

// IMPORTANT: Set to false to ensure we use real data, not mock data
let forceOfflineMode = false;

// Disable mock data completely
const USE_MOCK_DATA = false;

// Force disable all caching
const DISABLE_ALL_CACHING = true;

// Improved API status check
export const checkApiStatus = async () => {
  if (forceOfflineMode) {
    console.log("Forcing offline mode due to API unavailability");
    return false;
  }

  try {
    // Use different endpoint for better CORS handling
    const response = await fetch(`${API_BASE_URL}/api/`, {
      method: "GET",
      mode: "cors", // Changed from no-cors to cors
      cache: "no-cache",
      headers: {
        Accept: "application/json",
      },
    });

    // Check if response is truly ok
    const isAvailable = response.ok;
    console.log(`API status check: ${isAvailable ? "AVAILABLE" : "DOWN"}`);
    return isAvailable;
  } catch (e) {
    console.error("API appears to be down:", e);
    return false;
  }
};

// Modified fetch helper to prioritize real API data
export const safeFetch = async (endpoint, options = {}) => {
  // Check API status first
  const isApiAvailable = await checkApiStatus();
  
  if (!isApiAvailable && !USE_MOCK_DATA) {
    console.warn(`API unavailable and mock data is disabled`);
    throw new Error("API is currently unavailable");
  }
  
  try {
    const url = getApiUrl(endpoint);
    console.log("Fetching from:", url);

    // Add stronger cache-busting query parameters with random value
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(2, 15);
    const urlWithCache = url.includes('?') 
      ? `${url}&_t=${timestamp}&_r=${randomValue}` 
      : `${url}?_t=${timestamp}&_r=${randomValue}`;

    // Always use CORS mode
    options.mode = "cors";
    options.credentials = "omit"; // Don't send credentials

    // Add cache-busting headers
    options.headers = {
      ...options.headers,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    };

    // Get token from memory storage
    try {
      const token = memoryStorage.getItem("token");
      if (token) {
        options.headers["Authorization"] = `Token ${token}`;
      }
    } catch (tokenError) {
      console.warn("Could not access token:", tokenError);
    }

    // Make the request with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    options.signal = controller.signal;

    console.log(`Making API request to ${urlWithCache} with options:`, {
      ...options,
      headers: { ...options.headers }
    });

    const response = await fetch(urlWithCache, options);
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error details:", error);
    // Show a more helpful error message
    if (error.message.includes("Failed to fetch")) {
      console.warn("API connection failed.");
    }
    
    if (USE_MOCK_DATA) {
      console.warn("Using mock data as fallback.");
      return getMockData(endpoint);
    } else {
      throw error; // Re-throw the error instead of using mock data
    }
  }
};

/**
 * Force refresh data from the API and clear any caches
 * @param {string} endpoint - API endpoint to refresh
 * @returns {Promise<any>} The fresh data
 */
/**
 * Clear all caches related to API data
 */
export const clearCaches = () => {
  console.log('Clearing all API data caches...');
  // Clear any data stored in memoryStorage
  try {
    const keys = Object.keys(memoryStorage.getAll());
    keys.forEach(key => {
      if (key.includes('api/')) {
        console.log(`Clearing cache for: ${key}`);
        memoryStorage.remove(key);
      }
    });
  } catch (e) {
    console.error('Error clearing memory storage:', e);
  }

  // Clear any sessionStorage caches
  try {
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('api/')) {
        console.log(`Clearing sessionStorage for: ${key}`);
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Error clearing sessionStorage:', e);
  }

  // Clear any localStorage caches
  try {
    const localKeys = Object.keys(localStorage);
    localKeys.forEach(key => {
      if (key.includes('api/')) {
        console.log(`Clearing localStorage for: ${key}`);
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Error clearing localStorage:', e);
  }
};

export const forceRefresh = async (endpoint) => {
  try {
    // Clear all caches first
    clearCaches();
    console.log(`Force refreshing data from ${endpoint}...`);
    const url = getApiUrl(endpoint);

    // Add stronger cache-busting query parameters with random value
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(2, 15);
    const bustCache = url.includes('?') 
      ? `&_t=${timestamp}&_r=${randomValue}` 
      : `?_t=${timestamp}&_r=${randomValue}`;

    const fullUrl = `${url}${bustCache}`;
    console.log(`Making cache-busting request to: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method: "GET",
      mode: "cors", // Explicitly set CORS mode
      credentials: "omit", // Don't send credentials
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    console.log(`Successfully refreshed data from ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`Error force refreshing ${endpoint}:`, error);
    // Try fallback with safeFetch
    console.log(`Trying fallback method for ${endpoint}`);
    return safeFetch(endpoint);
  }
};

// Emergency mock data for critical features
function getMockData(endpoint) {
  console.warn(`Using mock data for ${endpoint} due to API connection issues`);

  if (endpoint.includes("/recipes/")) {
    const recipeId = parseInt(endpoint.split("/").filter(Boolean).pop());
    if (!isNaN(recipeId) && recipeId > 0) {
      // Return single recipe details
      return {
        id: recipeId,
        title: recipeId === 1 ? "Savory Tacos" : recipeId === 2 ? "Chocolate Chip Cookies" : `Delicious Recipe #${recipeId}`,
        description: recipeId === 1 ? "Delicious homemade tacos with fresh ingredients" : 
                    recipeId === 2 ? "Classic chocolate chip cookies that are crispy on the outside and chewy on the inside" :
                    "This is a mock recipe while the API is unavailable",
        ingredients: recipeId === 1 ? "Ground beef, Taco shells, Lettuce, Tomato, Cheese, Sour cream, Salsa" :
                    recipeId === 2 ? "Flour, Butter, Brown sugar, White sugar, Eggs, Vanilla extract, Baking soda, Salt, Chocolate chips" :
                    "Mock ingredients (API is currently unavailable)",
        instructions: recipeId === 1 ? "1. Brown the ground beef\n2. Add taco seasoning\n3. Warm the taco shells\n4. Assemble with toppings" :
                    recipeId === 2 ? "1. Cream butter and sugars\n2. Add eggs and vanilla\n3. Mix in dry ingredients\n4. Fold in chocolate chips\n5. Bake at 350°F for 10-12 minutes" :
                    "1. This is a mock recipe\n2. The API is currently unavailable\n3. Please try again later",
        image_url: recipeId === 1 ? "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80" :
                 recipeId === 2 ? "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80" :
                 "https://via.placeholder.com/300",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        user: 1,
        categories: [1, 3],
        is_favorite: false,
        rating: 4.8,
        prep_time: 15,
        cook_time: 20,
        servings: 4
      };
    }
  }

  if (endpoint.includes("/recipes")) {
    return [
      {
        id: 1,
        title: "Savory Tacos",
        description: "Delicious homemade tacos with fresh ingredients",
        ingredients: "Ground beef, Taco shells, Lettuce, Tomato, Cheese, Sour cream, Salsa",
        instructions: "1. Brown the ground beef\n2. Add taco seasoning\n3. Warm the taco shells\n4. Assemble with toppings",
        image_url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        user: 1,
        categories: [1, 3],
        is_favorite: false,
        rating: 4.8,
        prep_time: 15,
        cook_time: 20,
        servings: 4
      },
      {
        id: 2,
        title: "Chocolate Chip Cookies",
        description: "Classic chocolate chip cookies that are crispy on the outside and chewy on the inside",
        ingredients: "Flour, Butter, Brown sugar, White sugar, Eggs, Vanilla extract, Baking soda, Salt, Chocolate chips",
        instructions: "1. Cream butter and sugars\n2. Add eggs and vanilla\n3. Mix in dry ingredients\n4. Fold in chocolate chips\n5. Bake at 350°F for 10-12 minutes",
        image_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
        created_at: "2023-01-02T00:00:00Z",
        updated_at: "2023-01-02T00:00:00Z",
        user: 1,
        categories: [2, 5],
        is_favorite: true,
        rating: 4.9,
        prep_time: 15,
        cook_time: 12,
        servings: 24
      },
      {
        id: 3,
        title: "Vegetable Stir Fry",
        description: "Quick and healthy vegetable stir fry with a flavorful sauce",
        ingredients: "Broccoli, Bell peppers, Carrots, Snap peas, Garlic, Ginger, Soy sauce, Sesame oil, Rice vinegar, Brown sugar, Cornstarch",
        instructions: "1. Prepare vegetables\n2. Mix sauce ingredients\n3. Stir-fry vegetables\n4. Add sauce and cook until thickened",
        image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
        created_at: "2023-01-03T00:00:00Z",
        updated_at: "2023-01-03T00:00:00Z",
        user: 2,
        categories: [4, 6],
        is_favorite: false,
        rating: 4.5,
        prep_time: 10,
        cook_time: 15,
        servings: 4
      },
      {
        id: 4,
        title: "Classic Margherita Pizza",
        description: "Simple and delicious homemade pizza with fresh mozzarella and basil",
        ingredients: "Pizza dough, San Marzano tomatoes, Fresh mozzarella, Fresh basil, Olive oil, Salt",
        instructions: "1. Preheat oven to 500°F\n2. Stretch dough into a circle\n3. Top with crushed tomatoes, mozzarella, and basil\n4. Bake until crust is golden and cheese is bubbly",
        image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
        created_at: "2023-01-04T00:00:00Z",
        updated_at: "2023-01-04T00:00:00Z",
        user: 3,
        categories: [1, 7],
        is_favorite: true,
        rating: 4.7,
        prep_time: 20,
        cook_time: 10,
        servings: 2
      },
      {
        id: 5,
        title: "Creamy Mushroom Risotto",
        description: "Rich and creamy risotto with mushrooms and Parmesan cheese",
        ingredients: "Arborio rice, Mushrooms, Onion, Garlic, White wine, Chicken broth, Butter, Parmesan cheese, Parsley",
        instructions: "1. Sauté mushrooms and set aside\n2. Cook onion and garlic\n3. Add rice and toast\n4. Add wine and broth gradually, stirring constantly\n5. Finish with butter and Parmesan",
        image_url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
        created_at: "2023-01-05T00:00:00Z",
        updated_at: "2023-01-05T00:00:00Z",
        user: 2,
        categories: [1, 8],
        is_favorite: false,
        rating: 4.6,
        prep_time: 10,
        cook_time: 30,
        servings: 4
      }
    ];
  }

  if (endpoint.includes("/categories")) {
    return [
      { id: 1, name: "Main Course" },
      { id: 2, name: "Dessert" },
      { id: 3, name: "Mexican" },
      { id: 4, name: "Vegetarian" },
      { id: 5, name: "Baking" },
      { id: 6, name: "Asian" },
      { id: 7, name: "Italian" },
      { id: 8, name: "Comfort Food" }
    ];
  }
  
  if (endpoint.includes("/health")) {
    return { status: "ok", message: "API is running (mock data)" };
  }
  
  if (endpoint.includes("/api-token-auth")) {
    return { token: "mock-token-for-testing-purposes-only" };
  }
  
  if (endpoint.includes("/users/register")) {
    return { 
      token: "mock-registration-token", 
      user_id: 999, 
      email: "mock@example.com" 
    };
  }

  if (endpoint.includes("/users/me")) {
    return {
      id: 999,
      username: "mockuser",
      email: "mock@example.com",
      first_name: "Mock",
      last_name: "User",
      profile: {
        bio: "This is a mock user profile for testing when the API is down.",
        avatar: null
      }
    };
  }

  // Default fallback for any endpoint
  return { message: "Offline mode active - API connection failed" };
}

export default getApiUrl;
