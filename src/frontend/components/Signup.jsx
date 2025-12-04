import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './Auth.css';

function Signup() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/trade');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSignup = () => {
    loginWithRedirect({
      screen_hint: 'signup',
      appState: {
        returnTo: '/trade',
      },
    });
  };

  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>
        <p>Create an account to access the Fantasy Trade Evaluator</p>
        <button onClick={handleSignup} className="auth-button">
          Sign Up with Auth0
        </button>
        <p className="auth-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;

