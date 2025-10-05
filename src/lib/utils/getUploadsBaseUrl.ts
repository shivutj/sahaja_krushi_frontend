/**
 * Get the correct uploads base URL for file downloads
 * Uses the environment variable or falls back to the deployed backend URL
 */
export const getUploadsBaseUrl = (): string => {
  try {
    // Get the API base URL from environment
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;
    
    if (apiBaseUrl) {
      // Remove /api/V1 from the end to get the base URL
      return apiBaseUrl.replace('/api/V1', '') + '/uploads';
    }
  } catch (error) {
    console.warn('Failed to parse VITE_API_BASE_URL:', error);
  }
  
  // Fallback to deployed backend URL
  return 'https://sahaja-krushi-backend-h0t1.onrender.com/uploads';
};

export default getUploadsBaseUrl;
