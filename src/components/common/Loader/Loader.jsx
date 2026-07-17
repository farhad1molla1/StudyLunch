import React from 'react';
import './Loader.css';

const Loader = ({ variant = 'spinner', mascot = false, fullPage = false }) => {
  const renderLoader = () => {
    if (mascot) return <div className="loader-mascot animate-bounce">( ≽^•⩊•^≼ ) <span className="dots">...</span></div>;
    if (variant === 'dots') return <div className="loader-dots"><span></span><span></span><span></span></div>;
    return <div className="loader-spinner"></div>;
  };

  if (fullPage) return <div className="full-page-loader">{renderLoader()}</div>;
  return <div className="inline-loader">{renderLoader()}</div>;
};

export default Loader;