
import React from 'react';
import { Button } from '../ui/button';
import { TravelFormProvider } from './TravelFormProvider';
import { TravellerDetails } from './TravellerDetails';
import { TravelDetails } from './TravelDetails';
import { useTravelForm } from './TravelFormProvider';

const TravelFormContent = () => {
  const { currentStep, setCurrentStep, formData } = useTravelForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const steps = [
    {
      title: 'Traveller Information',
      component: <TravellerDetails />
    },
    {
      title: 'Travel Details',
      component: <TravelDetails />
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
        {steps[currentStep].component}
      </div>

      <div className="flex justify-between pt-6">
        {currentStep > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
          >
            Previous
          </Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button
            type="button"
            onClick={() => setCurrentStep(prev => prev + 1)}
          >
            Next
          </Button>
        ) : (
          <Button type="submit">Submit</Button>
        )}
      </div>
    </form>
  );
};

export const TravelForm = () => {
  return (
    <TravelFormProvider>
      <TravelFormContent />
    </TravelFormProvider>
  );
};

export default TravelForm;
