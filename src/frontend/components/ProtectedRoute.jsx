import { Navigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const location = useLocation();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 40; // Wait up to 8 seconds (40 * 200ms) for code exchange
  
  // Allow bypassing auth in development mode for testing
  const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';
  
  // Check if we're coming from callback (might need extra time for Auth0 to process)
  const isFromCallback = sessionStorage.getItem('auth0_callback_processed') === 'true';
  
  useEffect(() => {
    // Clear the callback flag after authentication is confirmed
    if (isFromCallback && isAuthenticated && user) {
      const timer = setTimeout(() => {
        sessionStorage.removeItem('auth0_callback_processed');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFromCallback, isAuthenticated, user]);
  
  // Retry logic for when coming from callback - give more time for Auth0 to initialize
  useEffect(() => {
    if (isFromCallback && !isLoading && !isAuthenticated && retryCount < maxRetries) {
      console.log(`ProtectedRoute: Waiting for auth from callback... (${retryCount + 1}/${maxRetries})`);
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isFromCallback, isLoading, isAuthenticated, retryCount]);
  
  if (skipAuth) {
    return children;
  }
  
  // Show loading if Auth0 is still loading OR if we're waiting for callback processing
  if (isLoading || (isFromCallback && !isAuthenticated && retryCount < maxRetries)) {
    return <div>Loading...</div>;
  }
  
  // Check authentication - also check for user object to ensure it's fully loaded
  // If we're coming from callback and still not authenticated after retries, 
  // give it one more moment before redirecting to login
  if (!isAuthenticated || !user) {
    // If we just came from callback, wait significantly more before giving up
    // This gives Auth0 time to complete the code exchange and update state
    if (isFromCallback && retryCount < maxRetries + 10) {
      console.log(`ProtectedRoute: Still waiting for auth from callback (${retryCount}/${maxRetries + 10})`);
      return <div>Loading...</div>;
    }
    
    console.log('ProtectedRoute: Not authenticated, redirecting to login', { 
      isAuthenticated, 
      hasUser: !!user, 
      isLoading,
      isFromCallback,
      retryCount 
    });
    // Clear the callback flag if we're giving up
    if (isFromCallback) {
      sessionStorage.removeItem('auth0_callback_processed');
    }
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;

