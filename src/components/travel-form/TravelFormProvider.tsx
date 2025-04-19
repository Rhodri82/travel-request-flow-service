import React, { createContext, useContext, useState } from 'react';
import { Traveller, TravelFormData } from '../../types/travel';

interface TravelFormContextType {
  formData: TravelFormData;
  setFormData: React.Dispatch<React.SetStateAction<TravelFormData>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isValid: boolean;
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
}

const TravelFormContext = createContext<TravelFormContextType | undefined>(undefined);

export const useTravelForm = () => {
  const context = useContext(TravelFormContext);
  if (!context) {
    throw new Error('useTravelForm must be used within a TravelFormProvider');
  }
  return context;
};

export const TravelFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<TravelFormData>({
    travellers: [{ id: '1', firstName: '', lastName: '', email: '' }],
    departureDate: null,
    returnDate: null,
    destination: '',
    budget: 0,
    transportMode: 'plane',
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isValid, setIsValid] = useState(false);

  return (
    <TravelFormContext.Provider 
      value={{ 
        formData, 
        setFormData, 
        currentStep, 
        setCurrentStep,
        isValid,
        setIsValid 
      }}
    >
      {children}
    </TravelFormContext.Provider>
  );
};
