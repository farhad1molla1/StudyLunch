import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { getUser, createUser } from '../../services/userService';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';

const LoginForm = () => {
  const { login, googleLogin, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});

  // Remember Me: Load saved email from localStorage on mount
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
    
    // Clear error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validation
    const emailError = !formData.email ? 'Email is required' : '';
    const passwordError = !formData.password ? 'Password is required' : '';

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    try {
      setLoading(true);
      
      // Execute login via AuthContext
      const credential = await login(formData.email, formData.password);
      const uid = credential?.user?.uid || credential?.uid;

      // Handle Remember Me Persistence
      if (formData.rememberMe) {
        localStorage.setItem('studylunch_remember_email', formData.email);
      } else {
        localStorage.removeItem('studylunch_remember_email');
      }

      // Check user profile completion status from Firestore
      const profileRes = await getUser(uid);
      
      toast.success('Welcome back 👋');

      // Check if profile is completed (e.g., university information exists)
      if (profileRes.success && profileRes.data?.university) {
        navigate('/dashboard');
      } else {
        navigate('/profile/setup');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const credential = await googleLogin();
      const uid = credential?.user?.uid || credential?.uid;
      const email = credential?.user?.email || credential?.email || '';
      const name = credential?.user?.displayName || credential?.name || 'StudyLunch User';
      const photoURL = credential?.user?.photoURL || credential?.photoURL || '';

      // Check if Firestore user document exists
      const profileRes = await getUser(uid);

      toast.success('Welcome back 👋');

      if (!profileRes.success || !profileRes.data) {
        // Exists? No -> Create Firestore User & go to Profile Setup
        await createUser(uid, name, email, photoURL);
        navigate('/profile/setup');
      } else if (!profileRes.data.university) {
        // Exists but Profile is incomplete -> go to Profile Setup
        navigate('/profile/setup');
      } else {
        // Exists and Profile completed -> go to Dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: 'Email is required to reset password' }));
      toast.error('Please enter your email address first.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(formData.email);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="auth-form" noValidate>
      <Input
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        disabled={loading}
        placeholder="Enter your email"
        autoComplete="email"
        required
      />

      <div className="password-field-container" style={{ position: 'relative' }}>
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={loading}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '38px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}
          tabIndex="-1"
        >
          {showPassword ? '👁️ Hide' : '👁️ Show'}
        </button>
      </div>

      <div className="auth-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0', fontSize: '14px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={loading}
          />
          Remember Me
        </label>
        
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={loading}
          style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: '500', cursor: 'pointer', padding: 0 }}
        >
          Forgot Password?
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        Login
      </Button>

      <div className="auth-divider" style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-muted)' }}>
        <span>or</span>
      </div>

      <Button
        type="button"
        variant="outline"
        fullWidth
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        Continue with Google
      </Button>
    </form>
  );
};

export default LoginForm;