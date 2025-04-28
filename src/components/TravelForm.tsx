import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import ContactInformation from './travel/ContactInformation';
import TravelRequirements from './travel/TravelRequirements';
import LAFHASection from './travel/LAFHASection';
import Declarations from './travel/Declarations';
import { TravelFormData, Traveller, FlightLeg, Ferry, LAFHADetails } from '@/types/travel';
import { LAFHA_RATES } from '@/constants/lafha';

// Default form data
const defaultFormData: TravelFormData = {
  bookingOnBehalf: false,
  travellers: [{
    id: '1',
    fullName: 'Current User',
    employeeId: 'EMP12345',
    region: '',
    costCentre: '',
    mobile: '',
  }],
  purpose: '',
  travelType: '',
  fromDate: '',
  toDate: '',
  destination: '',
  nights: 0,
  requireFlights: false,
  flightLegs: [],
  returnFlight: false,
  baggage: 'carry-on',
  requireFerry: false,
  ferries: [],
  requireCarHire: false,
  carHire: {
    pickupLocation: '',
    pickupDate: '',
    dropoffLocation: '',
    dropoffDate: '',
    carType: 'small',
    shared: false,
    sharedWith: ''
  },
  requireAccommodation: false,
  accommodation: {
    type: 'hotel',
    notes: ''
  },
  requireLAFHA: false,
  lafha: [],
  requireEmergencyContact: false,
  emergencyContact: {
    name: '',
    phone: '',
    relationship: ''
  },
  declarations: {
    correctAndApproved: false,
    payrollDeduction: false,
    audit: false,
    ctmBookings: false,
    noPersonalCards: false
  },
  travelFor: 'myself'
};

const TravelForm = () => {
  const [formData, setFormData] = useState<TravelFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValid, setFormValid] = useState(false);
  const [costEstimate, setCostEstimate] = useState(0);
  const { toast } = useToast();

  // Effect for calculating nights based on dates
  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      const start = new Date(formData.fromDate);
      const end = new Date(formData.toDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setFormData(prev => ({
        ...prev,
        nights: diffDays
      }));
    }
  }, [formData.fromDate, formData.toDate]);

  // Effect for LAFHA eligibility and calculations
  useEffect(() => {
    if (formData.requireAccommodation &&
      (formData.accommodation.type === 'private' || formData.accommodation.type === 'other')) {
      const eligible = true;
      
      if (eligible) {
        const days = formData.nights;
        let lafhaType = '';
        
        if (days > 21) {
          lafhaType = 'LAFHA - FBT applies';
        } else if (days > 90) {
          lafhaType = 'LAFHA - FBT applies';
        } else {
          lafhaType = 'Travel Allowance - PAYGW';
        }
        
        if (days > 365) {
          lafhaType = 'Reportable LAFHA (non-exempt)';
          toast({
            title: "Warning",
            description: "Trip exceeds 12 months - reportable LAFHA (non-exempt) applies",
            variant: "destructive"
          });
        }
        
        const defaultRate = formData.accommodation.type === 'private' 
          ? LAFHA_RATES['Private (OR23)'] 
          : LAFHA_RATES['Employee-arranged (OR24)'];
          
        if (formData.lafha.length === 0) {
          setFormData(prev => ({
            ...prev,
            requireLAFHA: true,
            lafha: [{
              id: Date.now().toString(),
              category: formData.accommodation.type === 'private' ? 'Private (OR23)' : 'Employee-arranged (OR24)',
              rate: defaultRate,
              days: days
            }]
          }));
        }
      }
    }
  }, [formData.accommodation, formData.requireAccommodation, formData.nights]);

  // Effect for cost estimate calculations
  useEffect(() => {
    let total = 0;
    formData.lafha.forEach(item => {
      total += item.rate * item.days;
    });
    setCostEstimate(total);
  }, [formData.lafha]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    if (type === 'checkbox') {
      if (name.startsWith('declarations.')) {
        const declarationKey = name.split('.')[1] as keyof typeof formData.declarations;
        setFormData(prev => ({
          ...prev,
          declarations: {
            ...prev.declarations,
            [declarationKey]: checked
          }
        }));
      } else if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parentKey]: {
            ...(prev[parentKey as keyof TravelFormData] as object),
            [childKey]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        
        if (parentKey === 'lafha') {
          const index = parseInt(childKey);
          const fieldName = name.split('.')[2];
          
          setFormData(prev => {
            const updatedLafha = [...prev.lafha];
            if (updatedLafha[index]) {
              updatedLafha[index] = {
                ...updatedLafha[index],
                [fieldName]: fieldName === 'rate' || fieldName === 'days' ? Number(value) : value
              };
            }
            return {
              ...prev,
              lafha: updatedLafha
            };
          });
        } else {
          setFormData(prev => ({
            ...prev,
            [parentKey]: {
              ...(prev[parentKey as keyof TravelFormData] as object),
              [childKey]: value
            }
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  // Add a new traveller
  const addTraveller = () => {
    const newTraveller: Traveller = {
      id: Date.now().toString(),
      fullName: '',
      employeeId: '',
      region: '',
      costCentre: '',
      mobile: '',
    };
    
    setFormData(prev => ({
      ...prev,
      travellers: [...prev.travellers, newTraveller]
    }));
  };

  // Remove a traveller
  const removeTraveller = (id: string) => {
    setFormData(prev => ({
      ...prev,
      travellers: prev.travellers.filter(t => t.id !== id)
    }));
  };

  // Add a flight leg
  const addFlightLeg = () => {
    const newLeg: FlightLeg = {
      id: Date.now().toString(),
      from: '',
      to: '',
      date: '',
      time: '',
      airlinePreference: ''
    };
    
    setFormData(prev => ({
      ...prev,
      flightLegs: [...prev.flightLegs, newLeg]
    }));
  };

  // Remove a flight leg
  const removeFlightLeg = (id: string) => {
    setFormData(prev => ({
      ...prev,
      flightLegs: prev.flightLegs.filter(leg => leg.id !== id)
    }));
  };

  // Add a ferry request
  const addFerry = () => {
    const newFerry: Ferry = {
      id: Date.now().toString(),
      from: '',
      to: '',
      date: '',
      time: '',
      notes: ''
    };
    
    setFormData(prev => ({
      ...prev,
      ferries: [...prev.ferries, newFerry]
    }));
  };

  // Remove a ferry request
  const removeFerry = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ferries: prev.ferries.filter(ferry => ferry.id !== id)
    }));
  };

  // Update specific traveller field
  const updateTravellerField = (id: string, field: keyof Traveller, value: string) => {
    setFormData(prev => ({
      ...prev,
      travellers: prev.travellers.map(t => 
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  // Update specific flight leg field
  const updateFlightLegField = (id: string, field: keyof FlightLeg, value: string) => {
    setFormData(prev => ({
      ...prev,
      flightLegs: prev.flightLegs.map(leg => 
        leg.id === id ? { ...leg, [field]: value } : leg
      )
    }));
  };

  // Update specific ferry field
  const updateFerryField = (id: string, field: keyof Ferry, value: string) => {
    setFormData(prev => ({
      ...prev,
      ferries: prev.ferries.map(ferry => 
        ferry.id === id ? { ...ferry, [field]: value } : ferry
      )
    }));
  };

  const addLAFHA = () => {
    const newLAFHA: LAFHADetails = {
      id: Date.now().toString(),
      category: 'Full Day (OR03)',
      rate: LAFHA_RATES['Full Day (OR03)'],
      days: formData.nights || 1
    };
    
    setFormData(prev => ({
      ...prev,
      lafha: [...prev.lafha, newLAFHA]
    }));
  };

  const removeLAFHA = (index: number) => {
    setFormData(prev => {
      const updatedLafha = [...prev.lafha];
      updatedLafha.splice(index, 1);
      return {
        ...prev,
        lafha: updatedLafha,
        requireLAFHA: updatedLafha.length > 0 ? prev.requireLAFHA : false
      };
    });
  };

  const updateLAFHA = (index: number, field: keyof LAFHADetails, value: any) => {
    setFormData(prev => {
      const updatedLafha = [...prev.lafha];
      
      if (updatedLafha[index]) {
        if (field === 'category' && typeof value === 'string') {
          updatedLafha[index] = {
            ...updatedLafha[index],
            category: value,
            rate: LAFHA_RATES[value as keyof typeof LAFHA_RATES] || updatedLafha[index].rate
          };
        } else {
          updatedLafha[index] = {
            ...updatedLafha[index],
            [field]: field === 'rate' || field === 'days' ? Number(value) : value
          };
        }
      }
      
      return {
        ...prev,
        lafha: updatedLafha
      };
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.travellers[0].fullName) errors['travellers[0].fullName'] = 'Full name is required';
    if (!formData.travellers[0].employeeId) errors['travellers[0].employeeId'] = 'Employee ID is required';
    if (!formData.travellers[0].costCentre) errors['travellers[0].costCentre'] = 'Cost centre is required';
    
    if (!formData.purpose) errors.purpose = 'Reason for travel is required';
    if (!formData.travelType) errors.travelType = 'Travel type is required';
    if (!formData.fromDate) errors.fromDate = 'From date is required';
    if (!formData.toDate) errors.toDate = 'To date is required';
    if (!formData.destination) errors.destination = 'Destination is required';
    
    if (formData.requireFlights && formData.flightLegs.length === 0) {
      errors.flightLegs = 'At least one flight leg is required';
    }
    
    formData.flightLegs.forEach((leg, index) => {
      if (!leg.from) errors[`flightLegs[${index}].from`] = 'From airport is required';
      if (!leg.to) errors[`flightLegs[${index}].to`] = 'To airport is required';
      if (!leg.date) errors[`flightLegs[${index}].date`] = 'Date is required';
    });
    
    if (formData.requireFerry && formData.ferries.length === 0) {
      errors.ferries = 'At least one ferry is required';
    }
    
    formData.ferries.forEach((ferry, index) => {
      if (!ferry.from) errors[`ferries[${index}].from`] = 'From location is required';
      if (!ferry.to) errors[`ferries[${index}].to`] = 'To location is required';
      if (!ferry.date) errors[`ferries[${index}].date`] = 'Date is required';
    });
    
    if (formData.requireCarHire) {
      if (!formData.carHire.pickupLocation) errors['carHire.pickupLocation'] = 'Pickup location is required';
      if (!formData.carHire.pickupDate) errors['carHire.pickupDate'] = 'Pickup date is required';
      if (!formData.carHire.dropoffLocation) errors['carHire.dropoffLocation'] = 'Drop-off location is required';
      if (!formData.carHire.dropoffDate) errors['carHire.dropoffDate'] = 'Drop-off date is required';
    }
    
    if (formData.requireAccommodation) {
      if (!formData.accommodation.type) errors['accommodation.type'] = 'Accommodation type is required';
    }
    
    if (!formData.emergencyContact.name) errors['emergencyContact.name'] = 'Emergency contact name is required';
    if (!formData.emergencyContact.phone) errors['emergencyContact.phone'] = 'Emergency contact phone is required';
    if (!formData.emergencyContact.relationship) errors['emergencyContact.relationship'] = 'Relationship is required';
    
    if (!Object.values(formData.declarations).every(Boolean)) {
      errors.declarations = 'All declarations must be accepted';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
    <div className="max-w-[1200px] mx-auto p-6">
      <div className="bg-[#003366] text-white p-6 -mx-6">
        <h1 className="text-3xl font-bold mb-2">Travel Request Form</h1>
        <p className="text-lg text-gray-200">Demo Interface</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <ContactInformation 
          formData={formData}
          updateTravellerField={updateTravellerField}
          handleInputChange={handleInputChange}
          addTraveller={addTraveller}
          removeTraveller={removeTraveller}
          formErrors={formErrors}
        />

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Job & Costing Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose of Travel <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                placeholder="Business Meeting"
                className="w-full"
              />
              {formErrors.purpose && (
                <div className="text-red-500 text-sm mt-1">{formErrors.purpose}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Travel Type <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                name="travelType"
                value={formData.travelType}
                onChange={handleInputChange}
              >
                <option value="">Select type</option>
                <option value="work">Work (on site)</option>
                <option value="conference">Conference</option>
                <option value="training">Training</option>
                <option value="emergency">Emergency (unplanned)</option>
                <option value="other">Other</option>
              </select>
              {formErrors.travelType && (
                <div className="text-red-500 text-sm mt-1">{formErrors.travelType}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleInputChange}
                className="w-full"
              />
              {formErrors.fromDate && (
                <div className="text-red-500 text-sm mt-1">{formErrors.fromDate}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleInputChange}
                className="w-full"
              />
              {formErrors.toDate && (
                <div className="text-red-500 text-sm mt-1">{formErrors.toDate}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="Sydney, Australia"
                className="w-full"
              />
              {formErrors.destination && (
                <div className="text-red-500 text-sm mt-1">{formErrors.destination}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Nights
              </label>
              <Input
                type="number"
                className="w-full bg-gray-100 cursor-not-allowed"
                value={formData.nights}
                readOnly
              />
              <p className="text-gray-500 text-sm mt-1">Automatically calculated from dates</p>
            </div>
          </div>
        </div>

        <TravelRequirements
          formData={formData}
          formErrors={formErrors}
          handleInputChange={handleInputChange}
          addFlightLeg={addFlightLeg}
          removeFlightLeg={removeFlightLeg}
          updateFlightLegField={updateFlightLegField}
          addFerry={addFerry}
          removeFerry={removeFerry}
          updateFerryField={updateFerryField}
        />

        {formData.requireLAFHA && (
          <LAFHASection
            formData={formData}
            handleInputChange={handleInputChange}
            updateLAFHA={updateLAFHA}
            addLAFHA={addLAFHA}
            removeLAFHA={removeLAFHA}
          />
        )}

        <Declarations
          declarations={formData.declarations}
          handleInputChange={handleInputChange}
          formErrors={formErrors}
        />

        <div className="flex justify-end mt-6">
          <button 
            type="submit" 
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default TravelForm;
