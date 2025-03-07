// API utility for environment-specific configuration

// Get the API base URL from environment variable or use a default value
const getApiBaseUrl = () => {
  console.log("Environment:", import.meta.env);
  console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

  // For production, use environment variable
  if (import.meta.env.VITE_API_URL) {
    console.log("Using VITE_API_URL:", import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // For local development
  if (import.meta.env.DEV) {
    console.log("Using DEV URL: http://localhost:8000");
    return "http://localhost:8000";
  }

  // Default production fallback
  console.log("Using fallback URL");
  return "https://savora-recipe-b7493c60c573-2ac1db511588.herokuapp.com";
};

export const API_BASE_URL = getApiBaseUrl();
console.log("API_BASE_URL set to:", API_BASE_URL);

/**
 * Get full API URL for a given endpoint
 * @param {string} endpoint - The API endpoint path (without leading slash)
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE_URL}${path}`;
  console.log("Generated API URL:", fullUrl);
  return fullUrl;
};

export default getApiUrl;
