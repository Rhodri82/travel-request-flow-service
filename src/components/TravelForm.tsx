import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// Update the Traveller interface to include alternativeEmail
interface Traveller {
  id: string;
  fullName: string;
  employeeId: string;
  region: string;
  costCentre: string;
  mobile: string;
  alternativeEmail?: string; // New optional field
  role?: string;
}

interface FlightLeg {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  airlinePreference: string;
}

interface Ferry {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  notes: string;
}

interface CarHire {
  pickupLocation: string;
  pickupDate: string;
  dropoffLocation: string;
  dropoffDate: string;
  carType: string;
  shared: boolean;
  sharedWith: string;
}

interface AccommodationDetails {
  type: 'hotel' | 'private' | 'other';
  notes: string;
}

interface LAFHADetails {
  id: string;
  category: string;
  rate: number;
  days: number;
}

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface TravelFormData {
  bookingOnBehalf: boolean;
  travellers: Traveller[];
  purpose: string;
  travelType: string;
  fromDate: string;
  toDate: string;
  destination: string;
  nights: number;
  requireFlights: boolean;
  flightLegs: FlightLeg[];
  returnFlight: boolean;
  baggage: string;
  requireFerry: boolean;
  ferries: Ferry[];
  requireCarHire: boolean;
  carHire: CarHire;
  requireAccommodation: boolean;
  accommodation: AccommodationDetails;
  requireLAFHA: boolean;
  lafha: LAFHADetails[];
  requireEmergencyContact: boolean;
  emergencyContact: EmergencyContact;
  declarations: {
    correctAndApproved: boolean;
    payrollDeduction: boolean;
    audit: boolean;
    ctmBookings: boolean;
    noPersonalCards: boolean;
  }
}

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
    alternativeEmail: '',
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
  }
};

// LAFHA rates data from requirements
const LAFHA_RATES = {
  'Full Day (OR03)': 148.70,
  'Private (OR23)': 268.34,
  'Employee-arranged (OR24)': 289.70,
  'Remote Area': 41.90,
  'Short Notice / Substandard': 41.90,
  'Incidentals (0A57)': 12.12,
  'Breakfast': 32.72,
  'Lunch': 46.51,
  'Dinner': 69.47
};

const TravelForm = () => {
  const [formData, setFormData] = useState<TravelFormData>(defaultFormData);
  const [sections, setSections] = useState({
    travellerDetails: true,
    purposeAndDates: true,
    travelRequirements: true,
    lafha: true,
    declarations: true,
    emergencyContact: true,
    costPreview: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValid, setFormValid] = useState(false);
  const [costEstimate, setCostEstimate] = useState(0);
  const { toast } = useToast();

  // Toggle section visibility
  const toggleSection = (section: keyof typeof sections) => {
    setSections({
      ...sections,
      [section]: !sections[section]
    });
  };

  // Calculate number of nights based on dates
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

  // Determine LAFHA eligibility and classification
  useEffect(() => {
    if (formData.requireAccommodation &&
      (formData.accommodation.type === 'private' || formData.accommodation.type === 'other')) {
      // Check for LAFHA eligibility conditions
      const eligible = true; // In a real app, we'd have more complex logic here
      
      if (eligible) {
        // Determine LAFHA type based on duration
        const days = formData.nights;
        let lafhaType = '';
        
        if (days > 21) {
          lafhaType = 'LAFHA - FBT applies';
        } else if (days > 90) { // Cumulative would need more tracking data
          lafhaType = 'LAFHA - FBT applies';
        } else {
          lafhaType = 'Travel Allowance - PAYGW';
        }
        
        // Check for 12+ month reportable LAFHA
        if (days > 365) {
          lafhaType = 'Reportable LAFHA (non-exempt)';
          // Show warning about exceeding 12 months
          toast({
            title: "Warning",
            description: "Trip exceeds 12 months - reportable LAFHA (non-exempt) applies",
            variant: "destructive"
          });
        }
        
        // Calculate default LAFHA based on type and duration
        const defaultRate = formData.accommodation.type === 'private' 
          ? LAFHA_RATES['Private (OR23)'] 
          : LAFHA_RATES['Employee-arranged (OR24)'];
          
        // Set LAFHA details if none exist yet
        if (formData.lafha.length === 0) {
          setFormData(prev => ({
            ...prev,
            requireLAFHA: true, // Auto-enable LAFHA
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

  // Calculate cost estimate
  useEffect(() => {
    let total = 0;
    
    // Add LAFHA costs
    formData.lafha.forEach(item => {
      total += item.rate * item.days;
    });
    
    // In a real app, we would estimate other costs as well
    
    setCostEstimate(total);
  }, [formData.lafha]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    // Handle checkbox inputs
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
    } 
    // Handle all other inputs
    else {
      // Handle nested properties
      if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        
        if (parentKey === 'lafha') {
          // Handle LAFHA array updates
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
      } 
      // Handle top-level properties
      else {
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
      alternativeEmail: '',
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

  // Add LAFHA entry
  const addLAFHA = () => {
    const newLAFHA: LAFHADetails = {
      id: Date.now().toString(),
      category: 'Full Day (OR03)',
      rate: LAFHA_RATES['Full Day (OR03)'],
      days: formData.nights || 1 // Default to 1 if nights is 0
    };
    
    setFormData(prev => ({
      ...prev,
      lafha: [...prev.lafha, newLAFHA]
    }));
  };

  // Remove LAFHA entry
  const removeLAFHA = (index: number) => {
    setFormData(prev => {
      const updatedLafha = [...prev.lafha];
      updatedLafha.splice(index, 1);
      return {
        ...prev,
        lafha: updatedLafha,
        // If no LAFHA entries left, disable LAFHA requirement
        requireLAFHA: updatedLafha.length > 0 ? prev.requireLAFHA : false
      };
    });
  };

  // Update LAFHA entry (fixed to correctly handle the category change with rate update)
  const updateLAFHA = (index: number, field: keyof LAFHADetails, value: any) => {
    setFormData(prev => {
      const updatedLafha = [...prev.lafha];
      
      if (updatedLafha[index]) {
        // If updating category, also update the rate
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

  // Validate form before submission
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.travellers[0].fullName) errors['travellers[0].fullName'] = 'Full name is required';
    if (!formData.travellers[0].employeeId) errors['travellers[0].employeeId'] = 'Employee ID is required';
    if (!formData.travellers[0].costCentre) errors['travellers[0].costCentre'] = 'Cost centre is required';
    
    if (!formData.purpose) errors.purpose = 'Reason for travel is required';
    if (!formData.travelType) errors.travelType = 'Travel type is required';
    if (!formData.fromDate) errors.fromDate = 'From date is required';
    if (!formData.toDate) errors.toDate = 'To date is required';
    if (!formData.destination) errors.destination = 'Destination is required';
    
    // Flight validation
    if (formData.requireFlights && formData.flightLegs.length === 0) {
      errors.flightLegs = 'At least one flight leg is required';
    }
    
    // Flight legs validation
    formData.flightLegs.forEach((leg, index) => {
      if (!leg.from) errors[`flightLegs[${index}].from`] = 'From airport is required';
      if (!leg.to) errors[`flightLegs[${index}].to`] = 'To airport is required';
      if (!leg.date) errors[`flightLegs[${index}].date`] = 'Date is required';
    });
    
    // Ferry validation
    if (formData.requireFerry && formData.ferries.length === 0) {
      errors.ferries = 'At least one ferry is required';
    }
    
    // Ferry details validation
    formData.ferries.forEach((ferry, index) => {
      if (!ferry.from) errors[`ferries[${index}].from`] = 'From location is required';
      if (!ferry.to) errors[`ferries[${index}].to`] = 'To location is required';
      if (!ferry.date) errors[`ferries[${index}].date`] = 'Date is required';
    });
    
    // Car hire validation
    if (formData.requireCarHire) {
      if (!formData.carHire.pickupLocation) errors['carHire.pickupLocation'] = 'Pickup location is required';
      if (!formData.carHire.pickupDate) errors['carHire.pickupDate'] = 'Pickup date is required';
      if (!formData.carHire.dropoffLocation) errors['carHire.dropoffLocation'] = 'Drop-off location is required';
      if (!formData.carHire.dropoffDate) errors['carHire.dropoffDate'] = 'Drop-off date is required';
    }
    
    // Accommodation validation
    if (formData.requireAccommodation) {
      if (!formData.accommodation.type) errors['accommodation.type'] = 'Accommodation type is required';
    }
    
    // Emergency contact validation
    if (!formData.emergencyContact.name) errors['emergencyContact.name'] = 'Emergency contact name is required';
    if (!formData.emergencyContact.phone) errors['emergencyContact.phone'] = 'Emergency contact phone is required';
    if (!formData.emergencyContact.relationship) errors['emergencyContact.relationship'] = 'Relationship is required';
    
    // Declarations validation
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

  return (
    <div className="servicenow-container">
      <div className="servicenow-header">
        <h1 className="servicenow-title">Travel and LAFHA Request Form</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* 1. TRAVELLER DETAILS */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.travellerDetails ? 'open' : ''}`} 
            onClick={() => toggleSection('travellerDetails')}
          >
            <span className={`servicenow-toggle-indicator ${sections.travellerDetails ? 'open' : ''}`}>
              1. TRAVELLER DETAILS
            </span>
          </div>
          
          {sections.travellerDetails && (
            <div className="servicenow-section-content">
              <div className="servicenow-form-group">
                <label className="servicenow-label">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="bookingOnBehalf"
                    checked={formData.bookingOnBehalf}
                    onChange={(e) => {
                      // Reset additional travellers when toggling
                      const updatedTravellers = e.target.checked 
                        ? [
                            ...formData.travellers,
                            {
                              id: Date.now().toString(),
                              fullName: '',
                              employeeId: '',
                              region: '',
                              costCentre: '',
                              mobile: '',
                            }
                          ]
                        : [formData.travellers[0]];
                      
                      setFormData(prev => ({
                        ...prev,
                        bookingOnBehalf: e.target.checked,
                        travellers: updatedTravellers
                      }));
                    }}
                  />
                  Booking on behalf of someone else?
                </label>
              </div>
              
              {formData.travellers.map((traveller, index) => (
                <div 
                  key={traveller.id} 
                  className={`servicenow-repeatable-block ${index === 0 ? '' : 'mt-4'}`}
                >
                  {index > 0 && (
                    <button 
                      type="button" 
                      className="servicenow-remove-button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          travellers: prev.travellers.filter(t => t.id !== traveller.id)
                        }));
                      }}
                    >
                      ✕
                    </button>
                  )}
                  
                  <div className="servicenow-grid">
                    <div className="servicenow-col-6">
                      <div className="servicenow-form-group">
                        <label className="servicenow-label servicenow-required">
                          {index === 0 ? 'Your Name' : 'Additional Traveller Name'}
                        </label>
                        <input 
                          type="text" 
                          className="servicenow-input"
                          value={traveller.fullName}
                          onChange={(e) => updateTravellerField(traveller.id, 'fullName', e.target.value)}
                          required
                        />
                        {formErrors[`travellers[${index}].fullName`] && (
                          <div className="servicenow-error">{formErrors[`travellers[${index}].fullName`]}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="servicenow-col-6">
                      <div className="servicenow-form-group">
                        <label className="servicenow-label servicenow-required">
                          {index === 0 ? 'Your Employee ID' : 'Additional Traveller Employee ID'}
                        </label>
                        <input 
                          type="text" 
                          className="servicenow-input"
                          value={traveller.employeeId}
                          onChange={(e) => updateTravellerField(traveller.id, 'employeeId', e.target.value)}
                          required
                        />
                        {formErrors[`travellers[${index}].employeeId`] && (
                          <div className="servicenow-error">{formErrors[`travellers[${index}].employeeId`]}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="servicenow-col-6">
                      <div className="servicenow-form-group">
                        <label className="servicenow-label">
                          Mobile Number
                        </label>
                        <input 
                          type="tel" 
                          className="servicenow-input"
                          value={traveller.mobile}
                          onChange={(e) => updateTravellerField(traveller.id, 'mobile', e.target.value)}
                          placeholder="Enter mobile number"
                        />
                      </div>
                    </div>
                    
                    <div className="servicenow-col-6">
                      <div className="servicenow-form-group">
                        <label className="servicenow-label">
                          Alternative Email
                        </label>
                        <input 
                          type="email" 
                          className="servicenow-input"
                          value={traveller.alternativeEmail || ''}
                          onChange={(e) => updateTravellerField(traveller.id, 'alternativeEmail', e.target.value)}
                          placeholder="Enter alternative email"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.bookingOnBehalf && (
                <button 
                  type="button" 
                  className="servicenow-add-button mt-2"
                  onClick={() => {
                    const newTraveller = {
                      id: Date.now().toString(),
                      fullName: '',
                      employeeId: '',
                      region: formData.travellers[0].region,
                      costCentre: formData.travellers[0].costCentre,
                      mobile: '',
                    };
                    
                    setFormData(prev => ({
                      ...prev,
                      travellers: [...prev.travellers, newTraveller]
                    }));
                  }}
                >
                  + Add another traveller
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. PURPOSE AND DATES */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.purposeAndDates ? 'open' : ''}`} 
            onClick={() => toggleSection('purposeAndDates')}
          >
            <span className={`servicenow-toggle-indicator ${sections.purposeAndDates ? 'open' : ''}`}>
              2. PURPOSE AND DATES
            </span>
          </div>
          
          {sections.purposeAndDates && (
            <div className="servicenow-section-content">
              <div className="servicenow-grid">
                <div className="servicenow-col-12">
                  <div className="servicenow-form-group">
                    <label className="servicenow-label servicenow-required">Reason for travel</label>
                    <input 
                      type="text" 
                      className="servicenow-input"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      required
                    />
                    {formErrors.purpose && (
                      <div className="servicenow-error">{formErrors.purpose}</div>
                    )}
                  </div>
                </div>
                
                <div className="servicenow-col-6">
                  <div className="servicenow-form-group">
                    <label className="servicenow-label servicenow-required">From Date</label>
                    <input 
                      type="date" 
                      className="servicenow-input"
                      name="fromDate"
                      value={formData.fromDate}
                      onChange={handleInputChange}
                      required
                    />
                    {formErrors.fromDate && (
                      <div className="servicenow-error">{formErrors.fromDate}</div>
                    )}
                  </div>
                </div>
                
                <div className="servicenow-col-6">
                  <div className="servicenow-form-group">
                    <label className="servicenow-label servicenow-required">To Date</label>
                    <input 
                      type="date" 
                      className="servicenow-input"
                      name="toDate"
                      value={formData.toDate}
                      onChange={handleInputChange}
                      required
                    />
                    {formErrors.toDate && (
                      <div className="servicenow-error">{formErrors.toDate}</div>
                    )}
                  </div>
                </div>
                
                <div className="servicenow-col-6">
                  <div className="servicenow-form-group">
                    <label className="servicenow-label servicenow-required">Destination</label>
                    <input 
                      type="text" 
                      className="servicenow-input"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      required
                    />
                    {formErrors.destination && (
                      <div className="servicenow-error">{formErrors.destination}</div>
                    )}
                  </div>
                </div>
                
                <div className="servicenow-col-6">
                  <div className="servicenow-form-group">
                    <label className="servicenow-label">Number of nights</label>
                    <input 
                      type="number" 
                      className="servicenow-input servicenow-readonly"
                      value={formData.nights}
                      readOnly
                    />
                    <div className="servicenow-helper-text">Automatically calculated from dates</div>
                  </div>
                </div>
                
                <div className="servicenow-col-6">
                  <div className="servicenow-form-group">
                    <label className="servicenow-label servicenow-required">Travel Type</label>
                    <select 
                      className="servicenow-select"
                      name="travelType"
                      value={formData.travelType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select type</option>
                      <option value="work">Work (on site)</option>
                      <option value="conference">Conference</option>
                      <option value="training">Training</option>
                      <option value="emergency">Emergency (unplanned)</option>
                      <option value="other">Other</option>
                    </select>
                    {formErrors.travelType && (
                      <div className="servicenow-error">{formErrors.travelType}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. TRAVEL REQUIREMENTS */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.travelRequirements ? 'open' : ''}`} 
            onClick={() => toggleSection('travelRequirements')}
          >
            <span className={`servicenow-toggle-indicator ${sections.travelRequirements ? 'open' : ''}`}>
              3. TRAVEL REQUIREMENTS
            </span>
          </div>
          
          {sections.travelRequirements && (
            <div className="servicenow-section-content">
              {/* Flights */}
              <div className="servicenow-form-group border-b pb-4 mb-4">
                <label className="servicenow-label font-semibold">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="requireFlights"
                    checked={formData.requireFlights}
                    onChange={handleInputChange}
                  />
                  Flights Required
                </label>
                
                {formData.requireFlights && (
                  <>
                    {formErrors.flightLegs && (
                      <div className="servicenow-error">{formErrors.flightLegs}</div>
                    )}
                    
                    {formData.flightLegs.map((leg, index) => (
                      <div key={leg.id} className="servicenow-repeatable-block">
                        <button 
                          type="button" 
                          className="servicenow-remove-button"
                          onClick={() => removeFlightLeg(leg.id)}
                        >
                          ✕
                        </button>
                        
                        <div className="servicenow-grid">
                          <div className="servicenow-col-6">
                            <div className="servicenow-form-group">
                              <label className="servicenow-label servicenow-required">From</label>
                              <input 
                                type="text" 
                                className="servicenow-input"
                                placeholder="Airport code or city"
                                value={leg.from}
                                onChange={(e) => updateFlightLegField(leg.id, 'from', e.target.value)}
                                required
                              />
                              {formErrors[`flightLegs[${index}].from`] && (
                                <div className="servicenow-error">{formErrors[`flightLegs[${index}].from`]}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="servicenow-col-6">
                            <div className="servicenow-form-group">
                              <label className="servicenow-label servicenow-required">To</label>
                              <input 
                                type="text" 
                                className="servicenow-input"
                                placeholder="Airport code or city"
                                value={leg.to}
                                onChange={(e) => updateFlightLegField(leg.id, 'to', e.target.value)}
                                required
                              />
                              {formErrors[`flightLegs[${index}].to`] && (
                                <div className="servicenow-error">{formErrors[`flightLegs[${index}].to`]}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="servicenow-col-4">
                            <div className="servicenow-form-group">
                              <label className="servicenow-label servicenow-required">Date</label>
                              <input 
                                type="date" 
                                className="servicenow-input"
                                value={leg.date}
                                onChange={(e) => updateFlightLegField(leg.id, 'date', e.target.value)}
                                required
                              />
                              {formErrors[`flightLegs[${index}].date`] && (
                                <div className="servicenow-error">{formErrors[`flightLegs[${index}].date`]}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="servicenow-col-4">
                            <div className="servicenow-form-group">
                              <label className="servicenow-label">Preferred Time</label>
                              <input 
                                type="time" 
                                className="servicenow-input"
                                value={leg.time}
                                onChange={(e) => updateFlightLegField(leg.id, 'time', e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="servicenow-col-4">
                            <div className="servicenow-form-group">
                              <label className="servicenow-label">Airline Preference</label>
                              <input 
                                type="text" 
                                className="servicenow-input"
                                value={leg.airlinePreference}
                                onChange={(e) => updateFlightLegField(leg.id, 'airlinePreference', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      type="button" 
                      className="servicenow-add-button"
                      onClick={addFlightLeg}
                    >
                      + Add another leg
                    </button>
                    
                    <div className="servicenow-form-group mt-4">
                      <label className="servicenow-label">
                        <input 
                          type="checkbox" 
                          className="servicenow-checkbox" 
                          name="returnFlight"
                          checked={formData.returnFlight}
                          onChange={handleInputChange}
                        />
                        Return flight required?
                      </label>
                    </div>
                    
                    <div className="servicenow-form-group">
                      <label className="servicenow-label">Baggage Preference</label>
                      <select 
                        className="servicenow-select"
                        name="baggage"
                        value={formData.baggage}
                        onChange={handleInputChange}
                      >
                        <option value="carry-on">Carry-on only</option>
                        <option value="checked">Checked baggage</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Ferry */}
              <div className="servicenow-form-group border-b pb-4 mb-4">
                <label className="servicenow-label font-semibold">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="requireFerry"
                    checked={formData.requireFerry}
                    onChange={handleInputChange}
                  />
                  Ferry Required
                </label>
                
                {formData.requireFerry && (
                  <>
                    {formErrors.ferries && (
                      <div className="servicenow-error">{formErrors.ferries}</div>
                    )}
                    
                    {formData.ferries.map((ferry, index) => (
                      <div key={ferry.id} className="servicenow-repeatable-block">
                        <button 
                          type="button" 
                          className="servicenow-remove-button"
                          onClick={() => removeFerry(ferry.id)}
                        >
                          ✕
                        </button>
                        
                        <div className="servicenow-grid">
                          <div className="servicenow-col-6">
                            <div className="servicenow-form-group">
                              <label className="servicenow-label servicenow-required">From</label>
                              <input 
                                type="text" 
                                className="servicenow-input"
                                value={ferry.from}
                                onChange={(e) => updateFerryField(ferry.id, 'from', e.target.value)}
                                required
                              />
                              {formErrors[`ferries[${index}].from`] && (
                                <div className="servicenow-error">{formErrors[`ferries[${index}].from`]}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="servicenow-col-6">
                            <div className="servicenow-form-group">
                              <label className="servicenow-label servicenow-required">To</label>
                              <input 
                                type="text" 
                                className="servicenow-input"
                                value={ferry.to}
                                onChange={(e) => updateFerryField(ferry.id, 'to', e.target.value)}
                                required
                              />
                              {formErrors[`ferries[${index}].to`] && (
                                <div className="servicenow-error">{formErrors[`ferries[${index}].to`]}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="servicenow-col-6">
                            <div className="servicenow-form-group">
                              <label className="servicenow-label servicenow-required">Date</label>
                              <input 
                                type="date" 
                                className="servicenow-input"
                                value={ferry.date}
                                onChange={(e) => updateFerryField(ferry.id, 'date', e.target.value)}
                                required
                              />
                              {formErrors[`ferries[${index}].date`] && (
                                <div className="servicenow-error">{formErrors[`ferries[${index}].date`]}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="servicenow-col-6">
                            <div className="servicenow-form-group">
                              <label className="servicenow-label">Time</label>
                              <input 
                                type="time" 
                                className="servicenow-input"
                                value={ferry.time}
                                onChange={(e) => updateFerryField(ferry.id, 'time', e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="servicenow-col-12">
                            <div className="servicenow-form-group">
                              <label className="servicenow-label">Notes</label>
                              <textarea 
                                className="servicenow-textarea"
                                value={ferry.notes}
                                onChange={(e) => updateFerryField(ferry.id, 'notes', e.target.value)}
                                placeholder="Vehicle details, etc."
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      type="button" 
                      className="servicenow-add-button"
                      onClick={addFerry}
                    >
                      + Add another ferry
                    </button>
                  </>
                )}
              </div>

              {/* Car Hire */}
              <div className="servicenow-form-group border-b pb-4 mb-4">
                <label className="servicenow-label font-semibold">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="requireCarHire"
                    checked={formData.requireCarHire}
                    onChange={handleInputChange}
                  />
                  Car Hire Required
                </label>
                
                {formData.requireCarHire && (
                  <>
                    <div className="servicenow-grid">
                      <div className="servicenow-col-6">
                        <div className="servicenow-form-group">
                          <label className="servicenow-label servicenow-required">Pickup Location</label>
                          <input 
                            type="text" 
                            className="servicenow-input"
                            name="carHire.pickupLocation"
                            value={formData.carHire.pickupLocation}
                            onChange={handleInputChange}
                            required
                          />
                          {formErrors['carHire.pickupLocation'] && (
                            <div className="servicenow-error">{formErrors['carHire.pickupLocation']}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="servicenow-col-6">
                        <div className="servicenow-form-group">
                          <label className="servicenow-label servicenow-required">Pickup Date</label>
                          <input 
                            type="date" 
                            className="servicenow-input"
                            name="carHire.pickupDate"
                            value={formData.carHire.pickupDate}
                            onChange={handleInputChange}
                            required
                          />
                          {formErrors['carHire.pickupDate'] && (
                            <div className="servicenow-error">{formErrors['carHire.pickupDate']}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="servicenow-col-6">
                        <div className="servicenow-form-group">
                          <label className="servicenow-label servicenow-required">Drop-off Location</label>
                          <input 
                            type="text" 
                            className="servicenow-input"
                            name="carHire.dropoffLocation"
                            value={formData.carHire.dropoffLocation}
                            onChange={handleInputChange}
                            required
                          />
                          {formErrors['carHire.dropoffLocation'] && (
                            <div className="servicenow-error">{formErrors['carHire.dropoffLocation']}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="servicenow-col-6">
                        <div className="servicenow-form-group">
                          <label className="servicenow-label servicenow-required">Drop-off Date</label>
                          <input 
                            type="date" 
                            className="servicenow-input"
                            name="carHire.dropoffDate"
                            value={formData.carHire.dropoffDate}
                            onChange={handleInputChange}
                            required
                          />
                          {formErrors['carHire.dropoffDate'] && (
                            <div className="servicenow-error">{formErrors['carHire.dropoffDate']}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="servicenow-col-6">
                        <div className="servicenow-form-group">
                          <label className="servicenow-label">Car Type</label>
                          <select 
                            className="servicenow-select"
                            name="carHire.carType"
                            value={formData.carHire.carType}
                            onChange={handleInputChange}
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="suv">SUV</option>
                            <option value="van">Van</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="servicenow-form-group">
                      <label className="servicenow-label">
                        <input 
                          type="checkbox" 
                          className="servicenow-checkbox" 
                          name="carHire.shared"
                          checked={formData.carHire.shared}
                          onChange={handleInputChange}
                        />
                        Shared car?
                      </label>
                    </div>
                    
                    {formData.carHire.shared && (
                      <div className="servicenow-form-group">
                        <label className="servicenow-label">Shared with</label>
                        <input 
                          type="text" 
                          className="servicenow-input"
                          name="carHire.sharedWith"
                          value={formData.carHire.sharedWith}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Accommodation */}
              <div className="servicenow-form-group">
                <label className="servicenow-label font-semibold">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="requireAccommodation"
                    checked={formData.requireAccommodation}
                    onChange={handleInputChange}
                  />
                  Accommodation Required
                </label>
                
                {formData.requireAccommodation && (
                  <>
                    <div className="servicenow-form-group">
                      <label className="servicenow-label">Accommodation Type</label>
                      <select 
                        className="servicenow-select"
                        name="accommodation.type"
                        value={formData.accommodation.type}
                        onChange={handleInputChange}
                      >
                        <option value="hotel">Hotel</option>
                        <option value="private">Private</option>
                        <option value="other">Other</option>
                      </select>
                      {formErrors['accommodation.type'] && (
                        <div className="servicenow-error">{formErrors['accommodation.type']}</div>
                      )}
                    </div>
                    
                    <div className="servicenow-form-group">
                      <label className="servicenow-label">Notes</label>
                      <textarea 
                        className="servicenow-textarea"
                        name="accommodation.notes"
                        value={formData.accommodation.notes}
                        onChange={handleInputChange}
                        placeholder="Any additional notes"
                      ></textarea>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. LAFHA */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.lafha ? 'open' : ''}`} 
            onClick={() => toggleSection('lafha')}
          >
            <span className={`servicenow-toggle-indicator ${sections.lafha ? 'open' : ''}`}>
              4. LAFHA
            </span>
          </div>
          
          {sections.lafha && (
            <div className="servicenow-section-content">
              <div className="servicenow-form-group">
                <label className="servicenow-label">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="requireLAFHA"
                    checked={formData.requireLAFHA}
                    onChange={handleInputChange}
                  />
                  Do you require LAFHA?
                </label>
              </div>
              
              {formData.requireLAFHA && (
                <>
                  {formErrors.lafha && (
                    <div className="servicenow-error">{formErrors.lafha}</div>
                  )}
                  
                  {formData.lafha.map((item, index) => (
                    <div key={item.id} className="servicenow-repeatable-block">
                      <button 
                        type="button" 
                        className="servicenow-remove-button"
                        onClick={() => removeLAFHA(index)}
                      >
                        ✕
                      </button>
                      
                      <div className="servicenow-grid">
                        <div className="servicenow-col-6">
                          <div className="servicenow-form-group">
                            <label className="servicenow-label servicenow-required">Category</label>
                            <select 
                              className="servicenow-select"
                              value={item.category}
                              onChange={(e) => updateLAFHA(index, 'category', e.target.value)}
                              required
                            >
                              <option value="">Select category</option>
                              {Object.keys(LAFHA_RATES).map(rate => (
                                <option key={rate} value={rate}>{rate}</option>
                              ))}
                            </select>
                            {formErrors[`lafha[${index}].category`] && (
                              <div className="servicenow-error">{formErrors[`lafha[${index}].category`]}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="servicenow-col-3">
                          <div className="servicenow-form-group">
                            <label className="servicenow-label servicenow-required">Rate ($)</label>
                            <input 
                              type="number" 
                              className="servicenow-input"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) => updateLAFHA(index, 'rate', e.target.value)}
                              required
                            />
                            {formErrors[`lafha[${index}].rate`] && (
                              <div className="servicenow-error">{formErrors[`lafha[${index}].rate`]}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="servicenow-col-3">
                          <div className="servicenow-form-group">
                            <label className="servicenow-label servicenow-required">Days</label>
                            <input 
                              type="number" 
                              className="servicenow-input"
                              min="1"
                              value={item.days}
                              onChange={(e) => updateLAFHA(index, 'days', e.target.value)}
                              required
                            />
                            {formErrors[`lafha[${index}].days`] && (
                              <div className="servicenow-error">{formErrors[`lafha[${index}].days`]}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="servicenow-col-12">
                          <div className="servicenow-form-group">
                            <div className="servicenow-calculator">
                              Total: ${(item.rate * item.days).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    className="servicenow-add-button"
                    onClick={addLAFHA}
                  >
                    + Add another LAFHA entry
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 5. EMERGENCY CONTACT */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.emergencyContact ? 'open' : ''}`} 
            onClick={() => toggleSection('emergencyContact')}
          >
            <span className={`servicenow-toggle-indicator ${sections.emergencyContact ? 'open' : ''}`}>
              5. EMERGENCY CONTACT
            </span>
          </div>
          
          {sections.emergencyContact && (
            <div className="servicenow-section-content">
              <div className="servicenow-form-group">
                <label className="servicenow-label">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="requireEmergencyContact"
                    checked={formData.requireEmergencyContact}
                    onChange={handleInputChange}
                  />
                  Do you require an emergency contact?
                </label>
              </div>
              
              {formData.requireEmergencyContact && (
                <>
                  <div className="servicenow-grid">
                    <div className="servicenow-col-4">
                      <div className="servicenow-form-group">
                        <label className="servicenow-label">Name</label>
                        <input 
                          type="text" 
                          className="servicenow-input"
                          name="emergencyContact.name"
                          value={formData.emergencyContact.name}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="servicenow-col-4">
                      <div className="servicenow-form-group">
                        <label className="servicenow-label">Phone</label>
                        <input 
                          type="text" 
                          className="servicenow-input"
                          name="emergencyContact.phone"
                          value={formData.emergencyContact.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="servicenow-col-4">
                      <div className="servicenow-form-group">
                        <label className="servicenow-label">Relationship</label>
                        <input 
                          type="text" 
                          className="servicenow-input"
                          name="emergencyContact.relationship"
                          value={formData.emergencyContact.relationship}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 6. DECLARATIONS */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.declarations ? 'open' : ''}`} 
            onClick={() => toggleSection('declarations')}
          >
            <span className={`servicenow-toggle-indicator ${sections.declarations ? 'open' : ''}`}>
              6. DECLARATIONS
            </span>
          </div>
          
          {sections.declarations && (
            <div className="servicenow-section-content">
              <div className="servicenow-form-group">
                <label className="servicenow-label">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="declarations.correctAndApproved"
                    checked={formData.declarations.correctAndApproved}
                    onChange={handleInputChange}
                  />
                  I have read and understood the terms and conditions of this form.
                </label>
              </div>
              
              <div className="servicenow-form-group">
                <label className="servicenow-label">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="declarations.payrollDeduction"
                    checked={formData.declarations.payrollDeduction}
                    onChange={handleInputChange}
                  />
                  I understand that my travel expenses will be subject to payroll deduction.
                </label>
              </div>
              
              <div className="servicenow-form-group">
                <label className="servicenow-label">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="declarations.audit"
                    checked={formData.declarations.audit}
                    onChange={handleInputChange}
                  />
                  I understand that my travel expenses will be subject to audit.
                </label>
              </div>
              
              <div className="servicenow-form-group">
                <label className="servicenow-label">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="declarations.ctmBookings"
                    checked={formData.declarations.ctmBookings}
                    onChange={handleInputChange}
                  />
                  I understand that my travel bookings will be subject to CTM.
                </label>
              </div>
              
              <div className="servicenow-form-group">
                <label className="servicenow-label">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="declarations.noPersonalCards"
                    checked={formData.declarations.noPersonalCards}
                    onChange={handleInputChange}
                  />
                  I understand that I will not be provided with personal cards for travel.
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 7. COST PREVIEW */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.costPreview ? 'open' : ''}`} 
            onClick={() => toggleSection('costPreview')}
          >
            <span className={`servicenow-toggle-indicator ${sections.costPreview ? 'open' : ''}`}>
              7. COST PREVIEW
            </span>
          </div>
          
          {sections.costPreview && (
            <div className="servicenow-section-content">
              <div className="servicenow-form-group">
                <label className="servicenow-label">Total Cost Estimate</label>
                <input 
                  type="text" 
                  className="servicenow-input servicenow-readonly"
                  value={`$${costEstimate.toFixed(2)}`}
                  readOnly
                />
                <div className="servicenow-helper-text">
                  This is an estimate based on LAFHA allowances. Actual costs may vary.
                </div>
              </div>
              
              {formData.lafha.length > 0 && (
                <div className="servicenow-cost-breakdown mt-4">
                  <h4 className="servicenow-subtitle mb-2">LAFHA Breakdown</h4>
                  <table className="servicenow-table w-full">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Rate</th>
                        <th>Days</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.lafha.map((item, index) => (
                        <tr key={item.id}>
                          <td>{item.category}</td>
                          <td>${item.rate.toFixed(2)}</td>
                          <td>{item.days}</td>
                          <td>${(item.rate * item.days).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="servicenow-total-row">
                        <td colSpan={3} className="text-right font-semibold">Total LAFHA</td>
                        <td className="font-semibold">${costEstimate.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="servicenow-footer">
          <button 
            type="submit"
            className="servicenow-button"
          >
            Submit Travel Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default TravelForm;
