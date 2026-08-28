import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createUserProfile } from '../../services/userService';
import './Signup.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setError('');
    setLoading(true);
    try {
      const user = await signup(email, password);
      
      // Auto-create base profile for Dashboard stats
      await createUserProfile(user.uid, {
        displayName: name,
        email: email,
        asked: 0,
        helped: 0,
        completed: 0,
        trust: 10
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create an account.');
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
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">Join the community and learn together.</p>
        </div>

        {error && <div className="auth-error-notice">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              required 
              placeholder="Farhad Hossain"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
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
          <div className="auth-input-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? 'Creating Account...' : 'Sign Up'}
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
          Already have an account? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;