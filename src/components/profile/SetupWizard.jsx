import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { updateUser } from '../../services/userService';
import AcademicInfoStep from './AcademicInfoStep';
import PersonalInfoStep from './PersonalInfoStep';
import ReviewStep from './ReviewStep';

const SetupWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Global State for the Wizard
  const [formData, setFormData] = useState({
    university: '',
    department: '',
    academicYear: '',
    bio: '',
    skills: [],
    learningGoals: []
  });

  const handleNextStep = () => setCurrentStep((prev) => prev + 1);
  const handlePrevStep = () => setCurrentStep((prev) => prev - 1);

  const handleFinishSetup = async () => {
    if (!user) {
      toast.error('Authentication error. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      // Clean and prepare data for Firestore
      const updateData = {
        university: formData.university.trim(),
        department: formData.department.trim(),
        academicYear: formData.academicYear.trim(),
        bio: formData.bio.trim(),
        skills: formData.skills,
        learningGoals: formData.learningGoals
      };

      // Call the securely separated Service layer
      const result = await updateUser(user.uid, updateData);

      if (result.success) {
        toast.success('🎉 Profile setup completed! Welcome to StudyLunch.');
        navigate('/dashboard');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-wizard">
      <div className="wizard-progress" style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        {[1, 2, 3].map((step) => (
          <div 
            key={step} 
            style={{ 
              flex: 1, 
              height: '4px', 
              background: currentStep >= step ? 'var(--primary-color)' : 'var(--border-color)',
              borderRadius: '2px',
              transition: 'background 0.3s ease'
            }} 
          />
        ))}
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
        {currentStep === 1 && 'Academic Information'}
        {currentStep === 2 && 'Personal Information'}
        {currentStep === 3 && 'Review Profile'}
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
        {currentStep === 1 && 'Let\'s start with your educational background.'}
        {currentStep === 2 && 'Add some details to help others know you better.'}
        {currentStep === 3 && 'Make sure everything looks good before finishing.'}
      </p>

      <div className="wizard-content">
        {currentStep === 1 && (
          <AcademicInfoStep formData={formData} setFormData={setFormData} onNext={handleNextStep} />
        )}
        {currentStep === 2 && (
          <PersonalInfoStep formData={formData} setFormData={setFormData} onNext={handleNextStep} onBack={handlePrevStep} />
        )}
        {currentStep === 3 && (
          <ReviewStep formData={formData} onBack={handlePrevStep} onSubmit={handleFinishSetup} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default SetupWizard;