
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { TravelFormData, Section } from '../../types/travel';
import { defaultFormData } from '../../data/defaultFormData';
import { TravellerDetailsSection } from './sections/TravellerDetailsSection';
import { TravelDetailsSection } from './sections/TravelDetailsSection';
import { LAFHASection } from './sections/LAFHASection';
import { DeclarationsSection } from './sections/DeclarationsSection';

const TravelForm = () => {
  const [formData, setFormData] = useState<TravelFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Record<Section, boolean>>({
    'traveller-details': true,
    'purpose-dates': true,
    'travel-requirements': true,
    'lafha': true,
    'emergency-contact': true,
    'declarations': true,
    'cost-preview': true
  });
  const { toast } = useToast();

  // Toggle section visibility
  const toggleSection = (section: Section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Update form data
  const updateFormData = (path: string, value: any) => {
    if (path.includes('.')) {
      const segments = path.split('.');
      setFormData(prev => {
        const newFormData = { ...prev };
        let current = newFormData as any;
        
        for (let i = 0; i < segments.length - 1; i++) {
          const segment = segments[i];
          if (!current[segment]) {
            current[segment] = {};
          }
          current = current[segment];
        }
        
        const finalSegment = segments[segments.length - 1];
        current[finalSegment] = value;
        
        return newFormData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [path]: value
      }));
    }
  };

  // Calculate nights based on dates
  const calculateNights = () => {
    if (formData.fromDate && formData.toDate) {
      const start = new Date(formData.fromDate);
      const end = new Date(formData.toDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      updateFormData('nights', diffDays);
      
      if (diffDays > 21) {
        toast({
          title: "FBT Risk Warning",
          description: "Travel exceeds 21 nights which may trigger FBT implications",
          variant: "destructive"
        });
      }
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.travellers[0].fullName) errors['travellers[0].fullName'] = 'Full name is required';
    if (!formData.travellers[0].employeeId) errors['travellers[0].employeeId'] = 'Employee ID is required';
    if (!formData.purpose) errors.purpose = 'Purpose is required';
    if (!formData.fromDate) errors.fromDate = 'From date is required';
    if (!formData.toDate) errors.toDate = 'To date is required';
    if (!formData.destination) errors.destination = 'Destination is required';
    
    if (formData.requireLAFHA && formData.lafha.length === 0) {
      errors.lafha = 'At least one LAFHA entry is required';
    }
    
    if (!Object.values(formData.declarations).every(Boolean)) {
      errors.declarations = 'All declarations must be accepted';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      toast({
        title: "Form Submitted",
        description: "Your travel request has been submitted successfully",
      });
      
      console.log('Form data submitted:', formData);
    } else {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-6">Travel and LAFHA Request Form</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <TravellerDetailsSection
          formData={formData}
          updateFormData={updateFormData}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          formErrors={formErrors}
        />

        <TravelDetailsSection
          formData={formData}
          updateFormData={updateFormData}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          formErrors={formErrors}
          calculateNights={calculateNights}
        />

        <LAFHASection
          formData={formData}
          updateFormData={updateFormData}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          formErrors={formErrors}
        />

        <DeclarationsSection
          formData={formData}
          updateFormData={updateFormData}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          formErrors={formErrors}
        />

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Travel Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default TravelForm;
