import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { getUser, createUser } from '../../services/userService';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword
} from '../../utils/validators';
import './Signup.css';

// Friendly Firebase error message translator
const formatAuthError = (err, isGoogle = false) => {
  if (!err) return '';
  const code = err.code || '';
  const message = err.message || '';

  // Google & popup errors
  if (code === 'auth/popup-closed-by-user' || message.includes('auth/popup-closed-by-user')) {
    return 'Google sign-in was cancelled.';
  }
  if (code === 'auth/popup-blocked' || message.includes('auth/popup-blocked')) {
    return 'Popup was blocked. Please allow popups and try again.';
  }
  if (code === 'auth/unauthorized-domain' || message.includes('auth/unauthorized-domain')) {
    return 'This domain is not authorized for Google sign-in.';
  }
  if (code === 'auth/cancelled-popup-request' || message.includes('auth/cancelled-popup-request')) {
    return 'A sign-in request is already in progress. Please wait a moment.';
  }
  if (code === 'auth/network-request-failed' || message.includes('auth/network-request-failed')) {
    return 'Network problem. Please try again.';
  }

  // Email / Password errors
  if (code === 'auth/email-already-in-use' || message.includes('auth/email-already-in-use')) {
    return 'This email is already in use. Please log in or use another email.';
  }
  if (code === 'auth/weak-password' || message.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 8 characters with uppercase, lowercase, and numbers.';
  }
  if (code === 'auth/invalid-email' || message.includes('auth/invalid-email')) {
    return 'The provided email address is invalid. Please double check.';
  }

  if (isGoogle) {
    return 'Google sign-in failed. Please try again.';
  }

  return (
    message
      .replace(/^Firebase:\s*/i, '')
      .replace(/Error\s*\([^)]*\):?/i, '')
      .trim() || 'Account creation failed. Please try again.'
  );
};

const Signup = () => {
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const isGoogleProcessing = useRef(false);
  const isSubmitting = useRef(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [iconError, setIconError] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (authError) {
      setAuthError('');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading || googleLoading || isSubmitting.current) return;

    // Field-level validations
    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email.trim());
    const passErr = validatePassword(formData.password);
    const confirmPassErr = validateConfirmPassword(formData.password, formData.confirmPassword);

    const errors = {};
    if (nameErr) errors.name = nameErr;
    if (emailErr) errors.email = emailErr;
    if (passErr) errors.password = passErr;
    if (confirmPassErr) errors.confirmPassword = confirmPassErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      isSubmitting.current = true;
      setLoading(true);
      setAuthError('');

      // Create Firebase Auth user
      const user = await signup(formData.name.trim(), formData.email.trim(), formData.password);
      const uid = user?.uid;

      // Ensure user document exists in Firestore
      if (uid) {
        try {
          await createUser(uid, formData.name.trim(), formData.email.trim(), '');
        } catch (dbErr) {
          console.warn('Initial user profile creation error:', dbErr);
        }
      }

      toast.success('🎉 Welcome to StudyLunch!');
      navigate('/dashboard');
    } catch (err) {
      console.error('error.code:', err?.code);
      console.error('error.message:', err?.message);
      console.error('full error object:', err);

      const friendlyMsg = formatAuthError(err, false);
      setAuthError(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      isSubmitting.current = false;
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (isGoogleProcessing.current || googleLoading || loading) {
      return;
    }
    isGoogleProcessing.current = true;
    setGoogleLoading(true);
    setAuthError('');

    try {
      const credential = await googleLogin();
      const uid = credential?.user?.uid || credential?.uid;
      const email = credential?.user?.email || credential?.email || '';
      const name = credential?.user?.displayName || credential?.name || 'StudyLunch User';
      const photoURL = credential?.user?.photoURL || credential?.photoURL || '';

      if (uid) {
        try {
          const profileRes = await getUser(uid);
          if (!profileRes || !profileRes.success || !profileRes.data) {
            await createUser(uid, name, email, photoURL);
          }
        } catch (dbErr) {
          console.warn('Initial user profile creation note:', dbErr);
        }
      }

      toast.success('🎉 Welcome to StudyLunch!');
      navigate('/dashboard');
    } catch (err) {
      console.error('error.code:', err?.code);
      console.error('error.message:', err?.message);
      console.error('full error object:', err);

      const friendlyMsg = formatAuthError(err, true);
      setAuthError(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      isGoogleProcessing.current = false;
      setGoogleLoading(false);
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
          <h2 className="auth-heading-title">Create your Account</h2>
          <p className="auth-heading-subtitle">Join fellow students and mentors in the StudyLunch community</p>
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

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="auth-form" noValidate>
          {/* Full Name */}
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="signup-name">Full Name</label>
            <div className="auth-input-wrapper">
              <input
                id="signup-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g. Alex Johnson"
                autoComplete="name"
                className={`auth-input ${fieldErrors.name ? 'has-error' : ''}`}
                required
              />
            </div>
            {fieldErrors.name && <span className="auth-field-error">{fieldErrors.name}</span>}
          </div>

          {/* Email Address */}
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="signup-email">Email Address</label>
            <div className="auth-input-wrapper">
              <input
                id="signup-email"
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

          {/* Password */}
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="signup-password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                placeholder="Minimum 8 characters (A-Z, a-z, 0-9)"
                autoComplete="new-password"
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
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="signup-confirm-password">Confirm Password</label>
            <div className="auth-input-wrapper">
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className={`auth-input auth-input-with-action ${fieldErrors.confirmPassword ? 'has-error' : ''}`}
                required
              />
              <button
                type="button"
                className="auth-eye-button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && <span className="auth-field-error">{fieldErrors.confirmPassword}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-auth-primary"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <>
                <svg className="auth-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>

          {/* Divider */}
          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Google Sign-Up Button */}
          <button
            type="button"
            className="btn-auth-google"
            onClick={handleGoogleSignup}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <>
                <svg className="auth-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                </svg>
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;