import React from 'react';

const Placeholder = ({ title, icon }) => {
  return (
    <div className="dashboard-page animate-fade-up">
      <h1 className="dashboard-title">{title}</h1>
      
      <section className="card-3d" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '50vh', 
        textAlign: 'center',
        marginTop: 'var(--space-md)'
      }}>
        <div className="animate-float" style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.9 }}>
          {icon}
        </div>
        <h2 style={{ color: 'var(--ink-blue)', fontSize: '1.8rem', marginBottom: '12px', fontWeight: '800' }}>
          Coming Soon
        </h2>
        <p style={{ color: 'var(--text-soft)', fontSize: '1.1rem', maxWidth: '400px', lineHeight: '1.6' }}>
          We are currently preparing the <strong>{title}</strong> area. Check back later to explore this feature!
        </p>
      </section>
    </div>
  );
};

export default Placeholder;