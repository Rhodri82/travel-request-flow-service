import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Smartphone } from 'lucide-react';
import { Input } from "@/components/ui/input";

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
    <div className="max-w-[1200px] mx-auto p-6">
      <div className="bg-[#003366] text-white p-6 -mx-6">
        <h1 className="text-3xl font-bold mb-2">Travel Request Form</h1>
        <p className="text-lg text-gray-200">Demo Interface</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        {/* Contact Information Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                Your Name
              </label>
              <Input 
                id="fullName"
                type="text" 
                value={formData.travellers[0].fullName}
                onChange={(e) => updateTravellerField(formData.travellers[0].id, 'fullName', e.target.value)}
                placeholder="John Smith"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="employeeId">
                Employee Number
              </label>
              <Input 
                id="employeeId"
                type="text" 
                value={formData.travellers[0].employeeId}
                onChange={(e) => updateTravellerField(formData.travellers[0].id, 'employeeId', e.target.value)}
                placeholder="EMP12345"
                className="w-full"
              />
            </div>

            <div className="col-span-2">
              <label className="inline-flex items-center text-gray-700 mb-4">
                <input 
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                  checked={formData.bookingOnBehalf}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      bookingOnBehalf: e.target.checked,
                      travellers: e.target.checked ? [
                        formData.travellers[0],
                        {
                          id: Date.now().toString(),
                          fullName: '',
                          employeeId: '',
                          region: '',
                          costCentre: '',
                          mobile: '',
                        }
                      ] : [formData.travellers[0]]
                    }));
                  }}
                />
                I am booking on behalf of someone else
              </label>
            </div>

            {formData.bookingOnBehalf && formData.travellers.slice(1).map((traveller) => (
              <div key={traveller.id} className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Traveller Name <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="text"
                    value={traveller.fullName}
                    onChange={(e) => updateTravellerField(traveller.id, 'fullName', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Traveller Employee ID <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="text"
                    value={traveller.employeeId}
                    onChange={(e) => updateTravellerField(traveller.id, 'employeeId', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input 
                  type="tel"
                  value={formData.travellers[0].mobile}
                  onChange={(e) => updateTravellerField(formData.travellers[0].id, 'mobile', e.target.value)}
                  className="pl-10 w-full"
                  placeholder="+61 XXX XXX XXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternative Email (optional)
              </label>
              <Input 
                type="email"
                className="w-full"
                placeholder="alternative@email.com"
              />
            </div>

            {/* Emergency Contact Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Name (optional)
              </label>
              <Input 
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Number (optional)
              </label>
              <Input 
                type="tel"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Job & Costing Information Section */}
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

        {/* Travel Requirements Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Travel Requirements</h2>

          {/* Flights */}
          <div className="mb-4">
            <label className="inline-flex items-center text-gray-700 mb-4">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                name="requireFlights"
                checked={formData.requireFlights}
                onChange={handleInputChange}
              />
              Flights Required
            </label>

            {formData.requireFlights && (
              <>
                {formErrors.flightLegs && (
                  <div className="text-red-500 text-sm mt-1">{formErrors.flightLegs}</div>
                )}

                {formData.flightLegs.map((leg, index) => (
                  <div key={leg.id} className="mb-4 p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="Airport code or city"
                          value={leg.from}
                          onChange={(e) => updateFlightLegField(leg.id, 'from', e.target.value)}
                          className="w-full"
                        />
                        {formErrors[`flightLegs[${index}].from`] && (
                          <div className="text-red-500 text-sm mt-1">{formErrors[`flightLegs[${index}].from`]}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="Airport code or city"
                          value={leg.to}
                          onChange={(e) => updateFlightLegField(leg.id, 'to', e.target.value)}
                          className="w-full"
                        />
                        {formErrors[`flightLegs[${index}].to`] && (
                          <div className="text-red-500 text-sm mt-1">{formErrors[`flightLegs[${index}].to`]}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={leg.date}
                          onChange={(e) => updateFlightLegField(leg.id, 'date', e.target.value)}
                          className="w-full"
                        />
                        {formErrors[`flightLegs[${index}].date`] && (
                          <div className="text-red-500 text-sm mt-1">{formErrors[`flightLegs[${index}].date`]}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Time
                        </label>
