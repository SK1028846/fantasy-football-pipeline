// Read from window object (set by runtime config) or fallback to import.meta.env
const API_BASE_URL = window.__ENV__?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/api';

// Helper function to make authenticated requests
// Updated to accept token as parameter since we can't use hooks in this service file
export const authenticatedFetch = async (url, options = {}, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      // Try to get error message from response body
      const contentType = response.headers.get('content-type');
      try {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const textError = await response.text();
          errorMessage = textError || errorMessage;
        }
      } catch (parseError) {
        // If we can't read the body, use status-based message
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Make sure your backend is running.');
    }
    throw error;
  }
};

// Trade API
// POST /trade - takes players on both sides as parameters, stores trade in DB, returns grade
export const evaluateTrade = async (sideA, sideB, token) => {
  const result = await authenticatedFetch('/trade', {
    method: 'POST',
    body: JSON.stringify({
      sideA: sideA,
      sideB: sideB,
    }),
  }, token);
  // Backend returns the grade in the response
  return result;
};

// Previous Trades API
// GET /previoustrades - returns a list of all previous trades with pagination
export const getPreviousTrades = async (page = 1, limit = 10, token) => {
  return authenticatedFetch(`/previoustrades?page=${page}&limit=${limit}`, {}, token);
};

