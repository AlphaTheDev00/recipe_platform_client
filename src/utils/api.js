// API utility for environment-specific configuration

// Get the API base URL from environment variable or use a default value
const getApiBaseUrl = () => {
  // For production, use environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // For local development
  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }

  // Default production fallback
  return "https://savora-recipe-b7493c60c573-2ac1db511588.herokuapp.com";
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Get full API URL for a given endpoint
 * @param {string} endpoint - The API endpoint path (without leading slash)
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};

export default getApiUrl;
