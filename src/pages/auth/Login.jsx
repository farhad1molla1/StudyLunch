import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard'); // Relative route, works safely on Mobile IP
    } catch (err) {
      setError('Failed to log in. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await googleLogin();
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card card-3d">
        <div className="auth-header">
          <div className="auth-logo">🍱 StudyLunch</div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Log in to continue learning together.</p>
        </div>

        {error && <div className="auth-error-notice">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label>Email</label>
            <input 
              type="email" 
              required 
              placeholder="student@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="auth-input-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleSignIn} 
          disabled={loading} 
          className="btn-auth-google"
        >
          🌐 Continue with Google
        </button>

        <div className="auth-footer">
          Need an account? <Link to="/signup">Sign up here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;