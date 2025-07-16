import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleCredentialResponse = useCallback((response) => {
    if (!response || !response.credential) {
      setError('Invalid Google Sign-In response');
      return;
    }
    
    const id_token = response.credential;
    setIsLoading(true);
    
    fetch('http://localhost:3000/auth/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: id_token })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      return response.json();
    })
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        throw new Error('Invalid token received');
      }
    })
    .catch(error => {
      console.error('Google Sign-In error:', error);
      setError('Google Sign-In failed. Please try again.');
      setIsLoading(false);
    });
  }, [setError, navigate, setIsLoading]);

  // Initialize Google Sign-In
  useEffect(() => {
    // Check if Google Sign-In API is available
    if (window.google && window.google.accounts) {
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        callback: handleCredentialResponse,
        auto_select: true,
        ux_mode: 'popup'
      });

      // Render the button
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { 
          theme: "outline", 
          size: "large",
          width: "100%",
          text_size: "16px",
          text_weight: "500",
          text_color: "#333",
          border_color: "#e0e0e0",
          background: "white",
          hover_background: "#f8f8f8",
          active_background: "#f0f0f0",
          focus_background: "white",
          focus_border_color: "#7c3aed",
          disabled_opacity: "0.6",
          disabled_cursor: "not-allowed",
          disabled_background: "#f5f5f5",
          disabled_border_color: "#e0e0e0",
          disabled_text_color: "#999",
          text_transform: "none",
          text_align: "center",
          padding: "0 1rem",
          transition: "all 0.2s ease"
        }
      );

      // Add error handling
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('User skipped or notification not displayed');
        }
      });
    }
  }, [handleCredentialResponse]);

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!isLogin && !name) {
      setError('Please enter your name');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(name, email, password);
        if (result.success) {
          await login(email, password);
        }
      }

      if (result.success) {
        // Check for pending data
        const pendingData = localStorage.getItem('pendingData');
        if (pendingData) {
          const data = JSON.parse(pendingData);
          localStorage.removeItem('pendingData');
          navigate('/visualize', { state: { data } });
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Floating Free Test Button */}
      <button 
        className="free-test-button"
        onClick={() => {
          const token = `free-test-token-${Date.now()}`;
          localStorage.setItem('token', token);
          navigate('/dashboard');
        }}
      >
        Free Test
      </button>


      <div className="brand-watermark">
        <span className="brand-text">SenseSheet</span>
        <span className="brand-by">by Anand</span>
      </div>
      <div className="auth-illustration">
        <div className="illustration-content">
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Excel to Visuals</h3>
              <p>Transform your spreadsheets into beautiful, interactive charts instantly</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>No Coding Needed</h3>
              <p>Create professional visualizations without writing a single line of code</p>
            </div>
          </div>
          <div className="feature-highlight">
            <h2>Data Visualization Made Simple</h2>
            <p>A web-based tool that lets you upload Excel files and instantly visualize data through interactive charts like bar, pie, and line graphs.</p>
            <div className="key-features">
              <span>• Drag & Drop Interface</span>
              <span>• Multiple Chart Types</span>
              <span>• Real-time Previews</span>
              <span>• Export Options</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <h1 style={{ color: '#d133b9' }}>SenseSheet</h1>
          </div>
          <h2 style={{ color: '#7c3aed' }}>{isLogin ? 'Welcome back!' : 'Create your account'}</h2>
          <p className="subtitle" style={{ color: '#7c3aed' }}>
            Multiple chart types to bring your data to life
          </p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
              {isLogin && (
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {!isLogin && (
              <div className="password-hint">
                Must be at least 6 characters
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <FaArrowRight className="button-icon" />
              </>
            )}
          </button>

          <div className="social-auth">
            <div className="divider">
              <span>or</span>
            </div>
            <div id="google-signin-button" className="google-signin-button">
              {/* Google Sign-In button will be rendered here */}
            </div>
          </div>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            className="toggle-link"
          >
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
