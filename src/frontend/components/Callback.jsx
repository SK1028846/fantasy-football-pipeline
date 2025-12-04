import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './Auth.css';

function Callback() {
  const { isLoading, isAuthenticated, error, user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 50; // Increased to 10 seconds for code exchange
  
  // Check URL for code parameter to confirm we're on callback
  const urlParams = new URLSearchParams(window.location.search);
  const hasCode = urlParams.has('code');

  useEffect(() => {
    const processCallback = async () => {
      console.log('Callback: Processing...', { 
        isLoading, 
        isAuthenticated, 
        hasUser: !!user, 
        error, 
        retryCount,
        hasCode,
        url: window.location.href
      });
      
      // If we don't have a code parameter and we're not loading/authenticated, 
      // we might not be on a valid callback (but Auth0 might have already processed it)
      // Only redirect if we've exhausted retries and still no auth
      if (!hasCode && !isLoading && !isAuthenticated && retryCount >= 5) {
        console.warn('Callback: No code parameter found and not authenticated after initial retries');
        // Don't redirect immediately - give Auth0 more time to process
      }
      
      // If there's an error, log full details and redirect to login
      if (error) {
        console.error('Auth0 callback error:', error);
        console.error('Error details:', {
          message: error.message,
          error: error.error,
          errorDescription: error.error_description,
          errorUri: error.error_uri,
          stack: error.stack
        });
        console.error('Current URL:', window.location.href);
        console.error('Expected redirect URI should be:', window.location.origin + '/callback');
        
        if (!hasRedirected) {
          setHasRedirected(true);
          navigate('/login', { replace: true });
        }
        return;
      }

      // Wait for Auth0 to finish loading (this includes code exchange)
      if (isLoading) {
        console.log('Callback: Still loading, waiting...');
        return;
      }

      // If not authenticated yet, wait and retry
      // The Auth0Provider should be processing the callback automatically
      if (!isAuthenticated && retryCount < maxRetries) {
        console.log(`Callback: Waiting for authentication... (${retryCount + 1}/${maxRetries})`);
        
        // Try to trigger code exchange by attempting to get token
        // This helps ensure the code exchange happens
        if (retryCount % 5 === 0) {
          // Every 5 retries, try to get token to trigger exchange
          try {
            await getAccessTokenSilently().catch(() => {
              // Expected to fail until code exchange completes
            });
          } catch (err) {
            // Ignore errors - we're just trying to trigger the exchange
          }
        }
        
        // Retry after delay
        const timeout = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 200);
        
        return () => clearTimeout(timeout);
      }

      // Wait for authentication to be confirmed
      // With authorization code flow, we need to wait for the code exchange to complete
      if (isAuthenticated && user) {
        try {
          console.log('Callback: User authenticated, verifying tokens...');
          
          // Try to get access token to ensure code exchange is complete
          try {
            const accessToken = await getAccessTokenSilently();
            console.log('Callback: Tokens verified', { 
              hasAccessToken: !!accessToken,
              isAuthenticated,
              hasUser: !!user
            });
          } catch (tokenErr) {
            console.warn('Could not get access token, but user is authenticated:', tokenErr);
            // Continue anyway if user is authenticated
          }
          
          // Wait a bit more to ensure Auth0 state is fully updated in all components
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (!hasRedirected) {
            console.log('Callback: Redirecting to /trade');
            setHasRedirected(true);
            // Set a flag to indicate we're coming from callback
            sessionStorage.setItem('auth0_callback_processed', 'true');
            // Use navigate instead of window.location to avoid full page reload
            // Auth0 state should already be available after code exchange
            navigate('/trade', { replace: true });
          }
        } catch (tokenError) {
          console.error('Error in callback processing:', tokenError);
          // Even if token fails, if we're authenticated, try to proceed after a delay
          if (!hasRedirected && user && isAuthenticated) {
            console.log('Callback: Proceeding despite token error, waiting then redirecting to /trade');
            await new Promise(resolve => setTimeout(resolve, 500));
            setHasRedirected(true);
            sessionStorage.setItem('auth0_callback_processed', 'true');
            navigate('/trade', { replace: true });
          }
        }
      } else if (!isAuthenticated && retryCount >= maxRetries) {
        // After max retries, redirect to login
        console.warn('Callback: Authentication not confirmed after retries, redirecting to login', {
          isLoading,
          isAuthenticated,
          hasUser: !!user,
          error,
          retryCount
        });
        if (!hasRedirected) {
          setHasRedirected(true);
          navigate('/login', { replace: true });
        }
      }
    };

    processCallback();
  }, [isLoading, isAuthenticated, error, user, navigate, hasRedirected, getAccessTokenSilently, retryCount, hasCode]);

  // Show loading state while processing callback
  if (isLoading || (!isAuthenticated && retryCount < maxRetries)) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div>Completing login...</div>
        </div>
      </div>
    );
  }

  // If we've redirected, show nothing
  if (hasRedirected) {
    return null;
  }

  // If there's an error or we've exhausted retries, show error
  if (error || (retryCount >= maxRetries && !isAuthenticated)) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div>Error completing login. Please try again.</div>
        </div>
      </div>
    );
  }

  return null;
}

export default Callback;

