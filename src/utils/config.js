// Configuration for API endpoints
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getApiUrl = (endpoint) => {
  // Make sure endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  return `${API_URL}${formattedEndpoint}`;
};

export default {
  API_URL,
  getApiUrl,
};
