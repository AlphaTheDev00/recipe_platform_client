import { getApiUrl } from "./api";

/**
 * Processes image URLs to ensure they work across environments
 * @param {string} imageUrl - The original image URL from the API
 * @param {number|string} id - An ID to use for consistent placeholder selection
 * @returns {string} A working image URL
 */
export const processImageUrl = (imageUrl, id) => {
  // If no image, use a placeholder
  if (!imageUrl) {
    return getPlaceholderImage(id);
  }

  // If already a full URL, use it (including Cloudinary URLs)
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    (typeof imageUrl === "string" &&
      (imageUrl.includes("cloudinary.com") ||
        imageUrl.includes("res.cloudinary.com")))
  ) {
    return imageUrl;
  }

  // For media URLs from Heroku, check if they're Cloudinary URLs
  if (typeof imageUrl === "string" && imageUrl.includes("/media/")) {
    if (imageUrl.includes("cloudinary")) {
      // This is already a Cloudinary URL, use it
      return imageUrl;
    }
    // Otherwise, use placeholder since Heroku doesn't persist regular uploads
    return getPlaceholderImage(id);
  }

  // Fallback to placeholder
  return getPlaceholderImage(id);
};

/**
 * Returns a consistent placeholder image based on an ID
 */
export const getPlaceholderImage = (id) => {
  const placeholderImages = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000&auto=format&fit=crop",
  ];

  // Convert id to number and ensure it's within array bounds
  const numId = typeof id === "string" ? parseInt(id, 10) || 0 : id || 0;
  const index = Math.abs(numId) % placeholderImages.length;
  return placeholderImages[index];
};
