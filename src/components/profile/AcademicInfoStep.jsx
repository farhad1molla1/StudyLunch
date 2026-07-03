import React from 'react';
import { toast } from 'react-hot-toast';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';

const AcademicInfoStep = ({ formData, setFormData, onNext }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    // Required Validation
    if (!formData.university.trim() || !formData.department.trim() || !formData.academicYear.trim()) {
      toast.error('Please fill in all academic details to continue.');
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleNext} className="step-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input
        label="University *"
        name="university"
        type="text"
        value={formData.university}
        onChange={handleChange}
        placeholder="e.g. Dhaka University"
        required
      />

      <Input
        label="Department *"
        name="department"
        type="text"
        value={formData.department}
        onChange={handleChange}
        placeholder="e.g. Computer Science"
        required
      />

      <Input
        label="Academic Year *"
        name="academicYear"
        type="text"
        value={formData.academicYear}
        onChange={handleChange}
        placeholder="e.g. 2nd Year, 3rd Semester"
        required
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <Button type="submit" variant="primary">
          Next Step
        </Button>
      </div>
    </form>
  );
};

export default AcademicInfoStep;