import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import { 
  validateName, 
  validateEmail, 
  validatePassword, 
  validateConfirmPassword 
} from '../../utils/validators';

const SignupForm = () => {
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field-specific error state as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Execute validation checks
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);

    // If any structural error exists, intercept submission
    if (nameError || emailError || passwordError || confirmPasswordError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError
      });
      return;
    }

    try {
      setLoading(true);
      // Trigger context API signup method
      await signup(formData.name, formData.email, formData.password);
      toast.success('🎉 Welcome to StudyLunch!');
      navigate('/profile/setup');
    } catch (err) {
      // Expose clean, friendly error message without raw Firebase outputs
      toast.error(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      await googleLogin();
      toast.success('🎉 Welcome to StudyLunch!');
      navigate('/profile/setup');
    } catch (err) {
      toast.error(err.message || 'Google signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="auth-form" noValidate>
      <Input
        label="Full Name"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        disabled={loading}
        placeholder="Enter your full name"
        autoComplete="name"
        required
      />

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

      <Input
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        disabled={loading}
        placeholder="Minimum 8 characters (A-Z, a-z, 0-9)"
        autoComplete="new-password"
        required
      />

      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        disabled={loading}
        placeholder="Repeat your password"
        autoComplete="new-password"
        required
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        Create Account
      </Button>

      <div className="auth-divider" style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-muted)' }}>
        <span>or</span>
      </div>

      <Button
        type="button"
        variant="outline"
        fullWidth
        onClick={handleGoogleSignup}
        disabled={loading}
      >
        Continue with Google
      </Button>
    </form>
  );
};

export default SignupForm;