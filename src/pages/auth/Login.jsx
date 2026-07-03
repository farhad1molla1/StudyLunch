import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card/Card';
import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="auth-page-container">
      <Card className="auth-card">
        <div className="auth-header" style={{ marginBottom: '24px' }}>
          <h1 className="auth-title" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Welcome Back</h1>
          <p className="auth-subtitle" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Log in to access your StudyLunch account</p>
        </div>

        {/* Modular LoginForm Injection */}
        <LoginForm />

        <div className="auth-footer" style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;