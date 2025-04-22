/**
 * Standard placeholder image as an inline SVG data URI
 * This avoids network requests to external services like via.placeholder.com
 */
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22400%22%20viewBox%3D%220%200%20600%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22%23e9ecef%22%20d%3D%22M0%200h600v400H0z%22%2F%3E%3Ctext%20fill%3D%22%23999%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2228%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22210%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';

/**
 * Generate a text placeholder image with custom text
 * @param {string} text - Custom text to display on the placeholder
 * @returns {string} Data URI for the SVG image
 */
export const getPlaceholderWithText = (text = 'No Image') => {
  const encodedText = encodeURIComponent(text);
  return `data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22400%22%20viewBox%3D%220%200%20600%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22%23e9ecef%22%20d%3D%22M0%200h600v400H0z%22%2F%3E%3Ctext%20fill%3D%22%23999%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2228%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22210%22%3E${encodedText}%3C%2Ftext%3E%3C%2Fsvg%3E`;
};

/**
 * Handle image loading errors by providing a fallback placeholder
 * @param {Event} event - The error event from the img element
 * @param {string} text - Optional custom text for the placeholder
 */
export const handleImageError = (event, text = 'No Image') => {
  event.target.onerror = null; // Prevent infinite error loops
  event.target.src = text ? getPlaceholderWithText(text) : PLACEHOLDER_IMAGE;
};

/**
 * Get the proper image URL for an image path from the server
 * @param {string} imagePath - The image path from the API
 * @returns {string} Complete image URL or placeholder if no valid path
 */
export const getImageUrl = (imagePath) => {
  // If path is falsy, return placeholder
  if (!imagePath) {
    console.log("getImageUrl: Image path is empty, returning placeholder");
    return PLACEHOLDER_IMAGE;
  }

  // If path is already a data URI or absolute URL, return as-is
  if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
    console.log(`getImageUrl: Image already has URL format: ${imagePath.substring(0, 30)}...`);
    return imagePath;
  }

  // For paths starting with /uploads, add the backend URL
  if (imagePath.startsWith('/uploads')) {
    // Use environment variable if available, otherwise default to localhost
    const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:3200';
    const fullUrl = `${apiUrl}${imagePath}`;
    console.log(`getImageUrl: Converting path ${imagePath} to full URL: ${fullUrl}`);
    return fullUrl;
  }

  console.log(`getImageUrl: Path ${imagePath} doesn't match expected format, using placeholder`);
  // If none of the above, use the placeholder
  return PLACEHOLDER_IMAGE;
}; 