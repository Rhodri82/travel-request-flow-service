
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import TravelFormSidebar from './travel-form/TravelFormSidebar';
import TravellerInfoStep from './travel-form/TravellerInfoStep';
import TravelDetailsStep from './travel-form/TravelDetailsStep';
import LAFHAStep from './travel-form/LAFHAStep';
import ApprovalsStep from './travel-form/ApprovalsStep';
import { TravelFormData, FormStep, Section } from '../types/travel';
import { defaultFormData } from '../data/defaultFormData';

const TravelForm = () => {
  const [formData, setFormData] = useState<TravelFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<FormStep>('traveller-info');
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
    // Handle nested updates with dot notation (e.g., 'travellers[0].fullName')
    if (path.includes('.')) {
      const segments = path.split('.');
      const topLevelKey = segments[0].replace(/\[\d+\]$/, '');
      
      setFormData(prev => {
        // Deep clone of the object
        const newFormData = { ...prev };
        
        // Navigate to the property we want to update
        let current = newFormData as any;
        let parent = null;
        let lastSegment = '';
        
        for (let i = 0; i < segments.length - 1; i++) {
          const segment = segments[i];
          
          // Handle array access (e.g., 'travellers[0]')
          if (segment.includes('[')) {
            const arrayName = segment.split('[')[0];
            const index = parseInt(segment.split('[')[1].replace(']', ''));
            
            if (!current[arrayName]) {
              current[arrayName] = [];
            }
            
            if (!current[arrayName][index]) {
              current[arrayName][index] = {};
            }
            
            parent = current;
            current = current[arrayName][index];
            lastSegment = index.toString();
          } else {
            if (!current[segment]) {
              current[segment] = {};
            }
            
            parent = current;
            current = current[segment];
            lastSegment = segment;
          }
        }
        
        // Set the property value
        const finalSegment = segments[segments.length - 1];
        current[finalSegment] = value;
        
        return newFormData;
      });
    } else {
      // Simple top-level update
      setFormData(prev => ({
        ...prev,
        [path]: value
      }));
    }
  };

  // Calculate number of nights based on dates
  const calculateNights = () => {
    if (formData.fromDate && formData.toDate) {
      const start = new Date(formData.fromDate);
      const end = new Date(formData.toDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      updateFormData('nights', diffDays);
      
      // Show warning if more than 21 nights (FBT risk)
      if (diffDays > 21) {
        toast({
          title: "FBT Risk Warning",
          description: "Travel exceeds 21 nights which may trigger FBT implications",
          variant: "destructive"
        });
      }
    }
  };

  // Switch to next step
  const goToNextStep = () => {
    switch(currentStep) {
      case 'traveller-info':
        setCurrentStep('travel-details');
        break;
      case 'travel-details':
        setCurrentStep('lafha');
        break;
      case 'lafha':
        setCurrentStep('approvals');
        break;
      default:
        break;
    }
  };

  // Switch to previous step
  const goToPreviousStep = () => {
    switch(currentStep) {
      case 'travel-details':
        setCurrentStep('traveller-info');
        break;
      case 'lafha':
        setCurrentStep('travel-details');
        break;
      case 'approvals':
        setCurrentStep('lafha');
        break;
      default:
        break;
    }
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    
    switch(currentStep) {
      case 'traveller-info':
        if (!formData.travellers[0].fullName) errors['travellers[0].fullName'] = 'Full name is required';
        if (!formData.travellers[0].employeeId) errors['travellers[0].employeeId'] = 'Employee ID is required';
        break;
      case 'travel-details':
        if (!formData.purpose) errors.purpose = 'Reason for travel is required';
        if (!formData.travelType) errors.travelType = 'Travel type is required';
        if (!formData.fromDate) errors.fromDate = 'From date is required';
        if (!formData.toDate) errors.toDate = 'To date is required';
        if (!formData.destination) errors.destination = 'Destination is required';
        break;
      case 'lafha':
        // LAFHA validation (only if LAFHA is required)
        if (formData.requireLAFHA && formData.lafha.length === 0) {
          errors.lafha = 'At least one LAFHA entry is required';
        }
        break;
      case 'approvals':
        // Declarations validation
        if (!Object.values(formData.declarations).every(Boolean)) {
          errors.declarations = 'All declarations must be accepted';
        }
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      goToNextStep();
    } else {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive"
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateCurrentStep()) {
      // In a real application, this would submit to ServiceNow
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

  // Determine which step to show
  const renderStep = () => {
    switch(currentStep) {
      case 'traveller-info':
        return (
          <TravellerInfoStep 
            formData={formData}
            updateFormData={updateFormData}
            toggleSection={toggleSection}
            expandedSections={expandedSections}
            formErrors={formErrors}
          />
        );
      case 'travel-details':
        return (
          <TravelDetailsStep 
            formData={formData}
            updateFormData={updateFormData}
            toggleSection={toggleSection}
            expandedSections={expandedSections}
            formErrors={formErrors}
            calculateNights={calculateNights}
          />
        );
      case 'lafha':
        return (
          <LAFHAStep 
            formData={formData}
            updateFormData={updateFormData}
            toggleSection={toggleSection}
            expandedSections={expandedSections}
            formErrors={formErrors}
          />
        );
      case 'approvals':
        return (
          <ApprovalsStep 
            formData={formData}
            updateFormData={updateFormData}
            toggleSection={toggleSection}
            expandedSections={expandedSections}
            formErrors={formErrors}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Form sidebar for navigation and progress */}
      <div className="w-full lg:w-1/4">
        <TravelFormSidebar 
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          formData={formData}
        />
      </div>
      
      {/* Main form content */}
      <div className="w-full lg:w-3/4 bg-white rounded-md shadow">
        <div className="servicenow-header">
          <h1 className="servicenow-title">Travel and LAFHA Request Form</h1>
        </div>
        
        <form>
          {renderStep()}
          
          {/* Navigation buttons */}
          <div className="servicenow-footer">
            {currentStep !== 'traveller-info' && (
              <button 
                type="button"
                className="servicenow-button-secondary"
                onClick={goToPreviousStep}
              >
                Previous
              </button>
            )}
            
            {currentStep !== 'approvals' ? (
              <button 
                type="button"
                className="servicenow-button"
                onClick={handleNextStep}
              >
                Next
              </button>
            ) : (
              <button 
                type="button"
                className="servicenow-button"
                onClick={handleSubmit}
              >
                Submit Travel Request
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TravelForm;
