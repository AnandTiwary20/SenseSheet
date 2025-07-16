import React, { useEffect, useRef } from 'react';

const GoogleAuth = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize Google Sign-In when the script is loaded
    window.onload = () => {
      if (!window.google || !window.google.accounts) {
        console.error('Google Sign-In library not loaded properly');
        return;
      }
      
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
          callback: handleCredentialResponse
        });

        // Render the button
        if (containerRef.current) {
          try {
            window.google.accounts.id.renderButton(
              containerRef.current,
              { theme: "outline", size: "large" }
            );
          } catch (renderError) {
            console.error('Error rendering Google Sign-In button:', renderError);
          }
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    };
  }, []);

  const handleCredentialResponse = (response) => {
    if (!response || !response.credential) {
      console.error('Invalid Google Sign-In response');
      return;
    }

    const id_token = response.credential;
    fetch('http://localhost:3000/auth/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: id_token })
    })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        window.location.href = `http://localhost:3000/?auth_token=${data.token}`;
      } else {
        console.error('No token received from server');
      }
    })
    .catch(error => {
      console.error('Google Sign-In error:', error);
    });
  };

  return (
    <div 
      id="google-sign-in-button"
      className="auth-button social-button google" 
      ref={containerRef}
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          background: 'linear-gradient(135deg, #333333 0%, #1a1a1a 100%)',
          transform: 'translateY(-1px)',
          boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)'
        },
        '&:active': {
          transform: 'translateY(0)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '10px' }}>
        <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      <span>Welcome To SenseSheet . Due To some 0Auth2(credits expired) issue Use Free Test if Sign in not working </span>
    </div>
  );
};

export default GoogleAuth;
