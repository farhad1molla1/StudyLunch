import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

// 🚀 Corrected Import Paths (তোমার ফোল্ডার স্ট্রাকচার অনুযায়ী)
import Card from '../../components/common/Card/Card';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';

const ProfileSetup = () => {
  const { user } = useAuth();
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!university.trim()) {
      toast.error('Please enter your university name.');
      return;
    }

    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        university: university.trim(),
        profileCompleted: true
      });

      toast.success('Profile setup complete! 🎉');
      window.location.href = '/dashboard'; 
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 'var(--space-16)' }}>
      <Card variant="elevated" style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-24)' }}>
          <h1 className="text-primary" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-8)' }}>
            Welcome to StudyLunch!
          </h1>
          <p className="text-secondary">
            Let's get your profile set up so you can start learning and mentoring.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-24)' }}>
            <Input
              label="University / Institution Name"
              placeholder="e.g. Dhaka University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              disabled={loading}
              fullWidth
              required
            />
          </div>

          <Button type="submit" variant="primary" size="large" fullWidth loading={loading}>
            Finish Setup
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfileSetup;