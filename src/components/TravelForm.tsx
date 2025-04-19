
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// Type definitions for our form data
interface Traveller {
  id: string;
  fullName: string;
  employeeId: string;
  region: string;
  costCentre: string;
  mobile: string;
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
    flightRequests: true,
    ferryRequests: true,
    carHire: true,
    accommodation: true,
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
            lafha: [{
              id: Date.now().toString(), // Add the id property
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
        setFormData(prev => ({
          ...prev,
          [parentKey]: {
            ...(prev[parentKey as keyof TravelFormData] as object),
            [childKey]: value
          }
        }));
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
      days: formData.nights
    };
    
    setFormData(prev => ({
      ...prev,
      lafha: [...prev.lafha, newLAFHA]
    }));
  };

  // Remove LAFHA entry
  const removeLAFHA = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lafha: prev.lafha.filter((_, i) => i !== index)
    }));
  };

  // Update LAFHA entry
  const updateLAFHA = (index: number, field: keyof LAFHADetails, value: any) => {
    setFormData(prev => ({
      ...prev,
      lafha: prev.lafha.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
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

        {/* 3. FLIGHT REQUESTS */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.flightRequests ? 'open' : ''}`} 
            onClick={() => toggleSection('flightRequests')}
          >
            <span className={`servicenow-toggle-indicator ${sections.flightRequests ? 'open' : ''}`}>
              3. FLIGHT REQUESTS
            </span>
          </div>
          
          {sections.flightRequests && (
            <div className="servicenow-section-content">
              <div className="servicenow-form-group">
                <label className="servicenow-label">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="requireFlights"
                    checked={formData.requireFlights}
                    onChange={handleInputChange}
                  />
                  Do you require flights?
                </label>
              </div>
              
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
          )}
        </div>

        {/* 4. FERRY REQUESTS */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.ferryRequests ? 'open' : ''}`} 
            onClick={() => toggleSection('ferryRequests')}
          >
            <span className={`servicenow-toggle-indicator ${sections.ferryRequests ? 'open' : ''}`}>
              4. FERRY REQUESTS
            </span>
          </div>
          
          {sections.ferryRequests && (
            <div className="servicenow-section-content">
              <div className="servicenow-form-group">
                <label className="servicenow-label">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="requireFerry"
                    checked={formData.requireFerry}
                    onChange={handleInputChange}
                  />
                  Do you require a ferry?
                </label>
              </div>
              
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
          )}
        </div>

        {/* 5. CAR HIRE */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.carHire ? 'open' : ''}`} 
            onClick={() => toggleSection('carHire')}
          >
            <span className={`servicenow-toggle-indicator ${sections.carHire ? 'open' : ''}`}>
              5. CAR HIRE
            </span>
          </div>
          
          {sections.carHire && (
            <div className="servicenow-section-content">
              <div className="servicenow-form-group">
                <label className="servicenow-label">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="requireCarHire"
                    checked={formData.requireCarHire}
                    onChange={handleInputChange}
                  />
                  Do you require car hire?
                </label>
              </div>
              
              {formData.requireCarHire && (
                <>
                  <div className="servicenow-form-group">
                    <label className="servicenow-label">Pickup Location</label>
                    <input 
                      type="text" 
                      className="servicenow-input"
                      value={formData.carHire.pickupLocation}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="servicenow-form-group">
                    <label className="servicenow-label">Pickup Date</label>
                    <input 
                      type="date" 
                      className="servicenow-input"
                      value={formData.carHire.pickupDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="servicenow-form-group">
                    <label className="servicenow-label">Drop-off Location</label>
                    <input 
                      type="text" 
                      className="servicenow-input"
                      value={formData.carHire.dropoffLocation}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="servicenow-form-group">
                    <label className="servicenow-label">Drop-off Date</label>
                    <input 
                      type="date" 
                      className="servicenow-input"
                      value={formData.carHire.dropoffDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="servicenow-form-group">
                    <label className="servicenow-label">Car Type</label>
                    <input 
                      type="text" 
                      className="servicenow-input"
                      value={formData.carHire.carType}
                      onChange={handleInputChange}
                    />
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
                        value={formData.carHire.sharedWith}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* 6. ACCOMMODATION */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.accommodation ? 'open' : ''}`} 
            onClick={() => toggleSection('accommodation')}
          >
            <span className={`servicenow-toggle-indicator ${sections.accommodation ? 'open' : ''}`}>
              6. ACCOMMODATION
            </span>
          </div>
          
          {sections.accommodation && (
            <div className="servicenow-section-content">
              <div className="servicenow-form-group">
                <label className="servicenow-label">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox" 
                    name="requireAccommodation"
                    checked={formData.requireAccommodation}
                    onChange={handleInputChange}
                  />
                  Do you require accommodation?
                </label>
              </div>
              
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
                      <option value="">Select type</option>
                      <option value="hotel">Hotel</option>
                      <option value="private">Private</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="servicenow-form-group">
                    <label className="servicenow-label">Notes</label>
                    <textarea 
                      className="servicenow-textarea"
                      value={formData.accommodation.notes}
                      onChange={handleInputChange}
                      placeholder="Any additional notes"
                    ></textarea>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 7. LAFHA */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.lafha ? 'open' : ''}`} 
            onClick={() => toggleSection('lafha')}
          >
            <span className={`servicenow-toggle-indicator ${sections.lafha ? 'open' : ''}`}>
              7. LAFHA
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
                              name={`lafha[${index}].category`}
                              value={item.category}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select category</option>
                              <option value="Full Day (OR03)">Full Day (OR03)</option>
                              <option value="Private (OR23)">Private (OR23)</option>
                              <option value="Employee-arranged (OR24)">Employee-arranged (OR24)</option>
                              <option value="Remote Area">Remote Area</option>
                              <option value="Short Notice / Substandard">Short Notice / Substandard</option>
                              <option value="Incidentals (0A57)">Incidentals (0A57)</option>
                              <option value="Breakfast">Breakfast</option>
                              <option value="Lunch">Lunch</option>
                              <option value="Dinner">Dinner</option>
                            </select>
                            {formErrors[`lafha[${index}].category`] && (
                              <div className="servicenow-error">{formErrors[`lafha[${index}].category`]}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="servicenow-col-6">
                          <div className="servicenow-form-group">
                            <label className="servicenow-label servicenow-required">Rate</label>
                            <input 
                              type="number" 
                              className="servicenow-input"
                              value={item.rate}
                              onChange={handleInputChange}
                              required
                            />
                            {formErrors[`lafha[${index}].rate`] && (
                              <div className="servicenow-error">{formErrors[`lafha[${index}].rate`]}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="servicenow-col-6">
                          <div className="servicenow-form-group">
                            <label className="servicenow-label servicenow-required">Days</label>
                            <input 
                              type="number" 
                              className="servicenow-input"
                              value={item.days}
                              onChange={handleInputChange}
                              required
                            />
                            {formErrors[`lafha[${index}].days`] && (
                              <div className="servicenow-error">{formErrors[`lafha[${index}].days`]}</div>
                            )}
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

        {/* 8. EMERGENCY CONTACT */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.emergencyContact ? 'open' : ''}`} 
            onClick={() => toggleSection('emergencyContact')}
          >
            <span className={`servicenow-toggle-indicator ${sections.emergencyContact ? 'open' : ''}`}>
              8. EMERGENCY CONTACT
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
                  <div className="servicenow-form-group">
                    <label className="servicenow-label">Name</label>
                    <input 
                      type="text" 
                      className="servicenow-input"
                      value={formData.emergencyContact.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="servicenow-form-group">
                    <label className="servicenow-label">Phone</label>
                    <input 
                      type="text" 
                      className="servicenow-input"
                      value={formData.emergencyContact.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="servicenow-form-group">
                    <label className="servicenow-label">Relationship</label>
                    <input 
                      type="text" 
                      className="servicenow-input"
                      value={formData.emergencyContact.relationship}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 9. DECLARATIONS */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.declarations ? 'open' : ''}`} 
            onClick={() => toggleSection('declarations')}
          >
            <span className={`servicenow-toggle-indicator ${sections.declarations ? 'open' : ''}`}>
              9. DECLARATIONS
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

        {/* 10. COST PREVIEW */}
        <div className="servicenow-section">
          <div 
            className={`servicenow-section-header ${sections.costPreview ? 'open' : ''}`} 
            onClick={() => toggleSection('costPreview')}
          >
            <span className={`servicenow-toggle-indicator ${sections.costPreview ? 'open' : ''}`}>
              10. COST PREVIEW
            </span>
          </div>
          
          {sections.costPreview && (
            <div className="servicenow-section-content">
              <div className="servicenow-form-group">
                <label className="servicenow-label">Total Cost Estimate</label>
                <input 
                  type="number" 
                  className="servicenow-input"
                  value={costEstimate}
                  readOnly
                />
              </div>
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
