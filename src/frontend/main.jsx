import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.jsx'

// Read from window object (set by runtime config) or fallback to import.meta.env
// Filter out template variables that weren't replaced (e.g., "${VITE_AUTH0_DOMAIN}")
const getEnvVar = (windowVar, envVar) => {
  const value = windowVar || envVar;
  // Check if it's a template variable that wasn't replaced
  if (value && typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
    return undefined;
  }
  return value;
};

// Debug: Log what we're getting
console.log('window.__ENV__:', window.__ENV__);
console.log('import.meta.env:', import.meta.env);

const domain = getEnvVar(window.__ENV__?.VITE_AUTH0_DOMAIN, import.meta.env.VITE_AUTH0_DOMAIN);
const clientId = getEnvVar(window.__ENV__?.VITE_AUTH0_CLIENT_ID, import.meta.env.VITE_AUTH0_CLIENT_ID);
const audience = getEnvVar(window.__ENV__?.VITE_AUTH0_AUDIENCE, import.meta.env.VITE_AUTH0_AUDIENCE);
// Use explicit redirect URI from env if provided, otherwise fall back to window.location.origin + /callback
const redirectUri = getEnvVar(window.__ENV__?.VITE_AUTH0_REDIRECT_URI, import.meta.env.VITE_AUTH0_REDIRECT_URI) || `${window.location.origin}/callback`;

console.log('Resolved values:', { domain, clientId, audience, redirectUri });
console.log('window.__ENV__?.VITE_AUTH0_REDIRECT_URI:', window.__ENV__?.VITE_AUTH0_REDIRECT_URI);
console.log('import.meta.env.VITE_AUTH0_REDIRECT_URI:', import.meta.env.VITE_AUTH0_REDIRECT_URI);
console.log('Current origin:', window.location.origin);
console.log('IMPORTANT: Make sure this redirect URI is added in your Auth0 dashboard:', redirectUri);

// Validate required Auth0 config
if (!domain || !clientId) {
  const errorMsg = 'Auth0 configuration is missing. Please check your environment variables.\n' +
    `Domain: ${domain ? '✓' : '✗ Missing'}\n` +
    `Client ID: ${clientId ? '✓' : '✗ Missing'}\n` +
    `\nFor local development, create a .env file with:\n` +
    `VITE_AUTH0_DOMAIN=your-domain.auth0.com\n` +
    `VITE_AUTH0_CLIENT_ID=your-client-id\n` +
    `VITE_AUTH0_AUDIENCE=your-audience\n`;
  console.error(errorMsg);
  
  // Show user-friendly error in the UI
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
      <div style="text-align: center; padding: 20px; border: 2px solid #ff4444; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #ff4444;">Configuration Error</h2>
        <p>Auth0 configuration is missing. Please check your environment variables.</p>
        <div style="text-align: left; margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 4px;">
          <p><strong>Domain:</strong> ${domain ? '✓ Set' : '✗ Missing'}</p>
          <p><strong>Client ID:</strong> ${clientId ? '✓ Set' : '✗ Missing'}</p>
        </div>
        <p style="font-size: 14px; color: #666;">
          For local development, create a <code>.env</code> file in the project root with your Auth0 credentials.
        </p>
      </div>
    </div>
  `;
  throw new Error('Auth0 configuration is missing');
}

// Handle redirect callback - this is called after Auth0 processes the callback
const onRedirectCallback = (appState) => {
  console.log('Auth0 onRedirectCallback called', appState);
  // appState contains the returnTo path from loginWithRedirect
  // We'll handle navigation in the Callback component instead
  // to have more control over the flow
};

// Build authorization params - only include audience if it's set and valid
const authorizationParams = {
  redirect_uri: redirectUri,
  response_type: 'code',
};

// Check if audience is the Management API (which won't work for frontend apps)
const isManagementAPI = audience && audience.includes('/api/v2/');

if (audience) {
  if (isManagementAPI) {
    console.error('⚠️ WARNING: Management API audience detected!');
    console.error('The Auth0 Management API (/api/v2/) is for server-side use only.');
    console.error('Frontend applications cannot use this audience.');
    console.error('Options:');
    console.error('1. Remove VITE_AUTH0_AUDIENCE from your environment variables (recommended if you don\'t have a custom API)');
    console.error('2. Create a custom API in Auth0 Dashboard and use its identifier as the audience');
    console.error('Skipping audience parameter to allow authentication to proceed...');
    // Don't add the Management API audience - it will cause unauthorized errors
  } else {
    authorizationParams.audience = audience;
    console.log('Using audience:', audience);
  }
} else {
  console.log('No audience configured - this is fine for frontend-only authentication');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={authorizationParams}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
)
