import React, { useState, useEffect } from 'react';
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

      if (!result.success) {
        setError(result.error || 'An error occurred. Please try again.');
      } else {
        navigate('/dashboard');
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
        </form>

        <div className="auth-footer">
          <div className="divider">
            <span>or</span>
          </div>
          
          <button className="social-button google">
            <svg className="social-icon" viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <b>Continue with Google</b>
          </button>
          
          <div className="auth-toggle">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button 
              type="button" 
              className="toggle-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              disabled={isLoading}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
