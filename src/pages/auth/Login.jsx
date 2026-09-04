import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { getUser, createUser } from '../../services/userService';
import './Login.css';

// Friendly Firebase error message translator
const formatAuthError = (err) => {
  if (!err) return '';
  const message = err.message || '';
  if (
    message.includes('auth/invalid-credential') ||
    message.includes('auth/wrong-password') ||
    message.includes('auth/user-not-found')
  ) {
    return 'Incorrect email or password. Please verify your details and try again.';
  }
  if (message.includes('auth/email-already-in-use')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (message.includes('auth/too-many-requests')) {
    return 'Too many attempts. For your security, please wait a few moments before trying again.';
  }
  if (message.includes('auth/popup-closed-by-user')) {
    return 'Google sign-in was canceled before completing.';
  }
  if (message.includes('auth/network-request-failed')) {
    return 'Network connection problem. Please check your internet connection.';
  }
  return (
    message
      .replace(/^Firebase:\s*/i, '')
      .replace(/Error\s*\([^)]*\):?/i, '')
      .trim() || 'Authentication failed. Please try again.'
  );
};

const Login = () => {
  const { login, googleLogin, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [iconError, setIconError] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState('');

  // Load saved email on mount if Remember Me was selected
  useEffect(() => {
    const savedEmail = localStorage.getItem('studylunch_remember_email');
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (authError) {
      setAuthError('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setAuthError('');

      const credential = await login(formData.email.trim(), formData.password);
      const uid = credential?.user?.uid || credential?.uid;

      if (formData.rememberMe) {
        localStorage.setItem('studylunch_remember_email', formData.email.trim());
      } else {
        localStorage.removeItem('studylunch_remember_email');
      }

      toast.success('Welcome back to StudyLunch! 👋');

      // Check profile completion in Firestore
      const profileRes = await getUser(uid);
      if (profileRes && profileRes.success && profileRes.data?.university) {
        navigate('/dashboard');
      } else {
        navigate('/profile/setup');
      }
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      setAuthError(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setAuthError('');

      const credential = await googleLogin();
      const uid = credential?.user?.uid || credential?.uid;
      const email = credential?.user?.email || credential?.email || '';
      const name = credential?.user?.displayName || credential?.name || 'StudyLunch User';
      const photoURL = credential?.user?.photoURL || credential?.photoURL || '';

      const profileRes = await getUser(uid);
      toast.success('Welcome back to StudyLunch! 👋');

      if (!profileRes || !profileRes.success || !profileRes.data) {
        await createUser(uid, name, email, photoURL);
        navigate('/profile/setup');
      } else if (!profileRes.data.university) {
        navigate('/profile/setup');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      setAuthError(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setFieldErrors((prev) => ({ ...prev, email: 'Enter your email above to reset password' }));
      toast.error('Please enter your email address first.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(formData.email.trim());
      toast.success('Password reset link sent! Check your inbox.');
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      setAuthError(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Brand & Logo Header */}
        <div className="auth-brand-area">
          <div className="auth-logo-badge">
            {!iconError ? (
              <img
                src="/assets/studylunch-icon.jpg"
                alt="StudyLunch Logo"
                className="auth-logo-img"
                onError={() => setIconError(true)}
              />
            ) : (
              <span className="auth-logo-fallback">🍱</span>
            )}
          </div>
          <h1 className="auth-brand-name">StudyLunch</h1>
          <span className="auth-brand-tagline">Learn Together. Appreciate Together.</span>
        </div>

        {/* Form Heading */}
        <div className="auth-heading-area">
          <h2 className="auth-heading-title">Welcome Back</h2>
          <p className="auth-heading-subtitle">Log in to continue your collaborative learning journey</p>
        </div>

        {/* Friendly Error Message Area */}
        {authError && (
          <div className="auth-error-banner" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{authError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="auth-form" noValidate>
          {/* Email Field */}
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="login-email">Email Address</label>
            <div className="auth-input-wrapper">
              <input
                id="login-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="name@university.edu"
                autoComplete="email"
                className={`auth-input ${fieldErrors.email ? 'has-error' : ''}`}
                required
              />
            </div>
            {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={`auth-input auth-input-with-action ${fieldErrors.password ? 'has-error' : ''}`}
                required
              />
              <button
                type="button"
                className="auth-eye-button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
          </div>

          {/* Options Row */}
          <div className="auth-options-row">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
                className="auth-checkbox"
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="auth-forgot-btn"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-auth-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="auth-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                </svg>
                <span>Logging In...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>

          {/* Divider */}
          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            className="btn-auth-google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/signup" className="auth-link">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;