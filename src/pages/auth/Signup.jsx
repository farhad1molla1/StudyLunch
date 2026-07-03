import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card/Card';
import SignupForm from '../../components/auth/SignupForm';

const Signup = () => {
  return (
    <div className="auth-page-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create your Account</h1>
          <p className="auth-subtitle">Join StudyLunch to collaborate and learn</p>
        </div>

        {/* Modular Form Component Injection */}
        <SignupForm />

        <div className="auth-footer" style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="auth-link" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
              Log In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Signup;