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
  try {
    const url = getApiUrl(endpoint);
    console.log("Fetching from:", url);

    // Add cache-busting query parameter
    const urlWithCache = url.includes('?') 
      ? `${url}&_t=${Date.now()}` 
      : `${url}?_t=${Date.now()}`;

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
    // Return mock data as fallback
    return getMockData(endpoint);
  }
};

/**
 * Force refresh data from the API and clear any caches
 * @param {string} endpoint - API endpoint to refresh
 * @returns {Promise<any>} The fresh data
 */
export const forceRefresh = async (endpoint) => {
  try {
    console.log(`Force refreshing data from ${endpoint}...`);
    const url = getApiUrl(endpoint);

    // Add cache-busting query parameter
    const bustCache = url.includes('?') 
      ? `&_t=${Date.now()}` 
      : `?_t=${Date.now()}`;

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
  console.log("Using mock data for endpoint:", endpoint);

  if (endpoint.includes("/recipes/")) {
    const recipeId = parseInt(endpoint.split("/").filter(Boolean).pop());
    if (!isNaN(recipeId) && recipeId > 0) {
      // Return single recipe details
      return {
        id: recipeId,
        title: `Mock Recipe #${recipeId}`,
        description: "This is a mock recipe while the API is unavailable",
        cooking_time: 30,
        difficulty: "medium",
        instructions:
          "1. This is a mock recipe\n2. The API is currently unavailable\n3. Please try again later",
        ingredients: [
          { id: 1, name: "Mock ingredient 1" },
          { id: 2, name: "Mock ingredient 2" },
        ],
        category_details: [
          { id: 1, name: "Offline Mode" },
          { id: 2, name: "Demo" },
        ],
        author: { username: "system" },
      };
    }
  }

  if (endpoint.includes("/recipes")) {
    return Array(12)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        title: `Demo Recipe #${i + 1}`,
        description: "Mock recipe available while API is down",
        cooking_time: 15 + i * 5,
        difficulty: i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard",
        avg_rating: (3 + (i % 3)) / 1.0,
      }));
  }

  if (endpoint.includes("/categories")) {
    return [
      { id: 1, name: "Italian" },
      { id: 2, name: "Asian" },
      { id: 3, name: "Desserts" },
    ];
  }

  // Default fallback for any endpoint
  return { message: "Offline mode active - API connection failed" };
}

export default getApiUrl;
