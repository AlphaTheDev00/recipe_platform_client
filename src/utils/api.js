// API utility for environment-specific configuration

// Get the API base URL from environment variable or use a default value
const getApiBaseUrl = () => {
  // For production, use fixed production URL - hardcoded for reliability
  if (window.location.hostname === "savora-recipe.netlify.app") {
    return "https://savora-recipe-b7493c60c573.herokuapp.com";
  }

  // For local development
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:8000";
  }

  // Fallback - this should match your Heroku app name
  return "https://savora-recipe-b7493c60c573.herokuapp.com";
};

export const API_BASE_URL = getApiBaseUrl();
console.log("API_BASE_URL set to:", API_BASE_URL);

/**
 * Get full API URL for a given endpoint
 * @param {string} endpoint - The API endpoint path (without leading slash)
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  // Handle undefined or null endpoint
  if (!endpoint) {
    return API_BASE_URL;
  }

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE_URL}${path}`;
  console.log("Generated API URL:", fullUrl);
  return fullUrl;
};

export default getApiUrl;
