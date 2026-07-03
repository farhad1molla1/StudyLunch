import React from 'react';
import Card from '../../components/common/Card/Card';
import SetupWizard from '../../components/profile/SetupWizard';

const ProfileSetup = () => {
  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
      <Card className="setup-card" style={{ width: '100%', maxWidth: '600px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Welcome Aboard! 🚀</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Complete your profile to unlock all features.</p>
        </div>
        
        {/* Render the Wizard Engine */}
        <SetupWizard />
      </Card>
    </div>
  );
};

export default ProfileSetup;