import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { TravelFormData, Section, Traveller } from '../types/travel';
import { defaultFormData } from '../data/defaultFormData';

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
    
    // Basic validation for required fields
    if (!formData.travellers[0].fullName) errors['travellers[0].fullName'] = 'Full name is required';
    if (!formData.travellers[0].employeeId) errors['travellers[0].employeeId'] = 'Employee ID is required';
    if (!formData.purpose) errors.purpose = 'Purpose is required';
    if (!formData.fromDate) errors.fromDate = 'From date is required';
    if (!formData.toDate) errors.toDate = 'To date is required';
    if (!formData.destination) errors.destination = 'Destination is required';
    
    // LAFHA validation (only if required)
    if (formData.requireLAFHA && formData.lafha.length === 0) {
      errors.lafha = 'At least one LAFHA entry is required';
    }
    
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
    
    updateFormData('travellers', [...formData.travellers, newTraveller]);
  };

  // Remove a traveller
  const removeTraveller = (id: string) => {
    updateFormData('travellers', formData.travellers.filter(t => t.id !== id));
  };

  // Update specific traveller field
  const updateTravellerField = (id: string, field: keyof Traveller, value: string) => {
    const updatedTravellers = formData.travellers.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    );
    
    updateFormData('travellers', updatedTravellers);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-6">Travel and LAFHA Request Form</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Traveller Information */}
        <Collapsible open={expandedSections['traveller-details']} onOpenChange={() => toggleSection('traveller-details')}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
              <h2 className="text-lg font-medium">Traveller Information</h2>
              <span>{expandedSections['traveller-details'] ? '−' : '+'}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
            {/* Traveller form fields */}
            <div className="servicenow-section-content">
              <div className="servicenow-form-group mb-4">
                <label className="servicenow-label flex items-center">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox mr-2" 
                    checked={formData.bookingOnBehalf}
                    onChange={(e) => {
                      // Reset additional travellers when toggling
                      const updatedTravellers = e.target.checked 
                        ? [
                            formData.travellers[0],
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
                      
                      updateFormData('bookingOnBehalf', e.target.checked);
                      updateFormData('travellers', updatedTravellers);
                    }}
                  />
                  <span>Booking on behalf of someone else?</span>
                </label>
              </div>
              
              {formData.travellers.map((traveller, index) => (
                <div 
                  key={traveller.id} 
                  className="servicenow-repeatable-block mb-4 p-4 border border-gray-200 rounded relative"
                >
                  {index > 0 && (
                    <button 
                      type="button" 
                      className="servicenow-remove-button absolute top-2 right-2 text-red-500"
                      onClick={() => removeTraveller(traveller.id)}
                    >
                      ✕
                    </button>
                  )}
                  
                  <h3 className="font-medium mb-3">
                    {index === 0 ? 'Primary Traveller' : `Additional Traveller ${index}`}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="servicenow-form-group">
                      <label className="servicenow-label servicenow-required block mb-1">
                        Full Name
                      </label>
                      <input 
                        type="text" 
                        className="servicenow-input w-full"
                        value={traveller.fullName}
                        onChange={(e) => updateTravellerField(traveller.id, 'fullName', e.target.value)}
                        required
                      />
                      {formErrors[`travellers[${index}].fullName`] && (
                        <div className="servicenow-error mt-1">{formErrors[`travellers[${index}].fullName`]}</div>
                      )}
                    </div>
                    
                    <div className="servicenow-form-group">
                      <label className="servicenow-label servicenow-required block mb-1">
                        Employee ID
                      </label>
                      <input 
                        type="text" 
                        className="servicenow-input w-full"
                        value={traveller.employeeId}
                        onChange={(e) => updateTravellerField(traveller.id, 'employeeId', e.target.value)}
                        required
                      />
                      {formErrors[`travellers[${index}].employeeId`] && (
                        <div className="servicenow-error mt-1">{formErrors[`travellers[${index}].employeeId`]}</div>
                      )}
                    </div>
                    
                    <div className="servicenow-form-group">
                      <label className="servicenow-label servicenow-required block mb-1">
                        Cost Centre
                      </label>
                      <input 
                        type="text" 
                        className="servicenow-input w-full"
                        value={traveller.costCentre}
                        onChange={(e) => updateTravellerField(traveller.id, 'costCentre', e.target.value)}
                        required
                      />
                      {formErrors[`travellers[${index}].costCentre`] && (
                        <div className="servicenow-error mt-1">{formErrors[`travellers[${index}].costCentre`]}</div>
                      )}
                    </div>
                    
                    <div className="servicenow-form-group">
                      <label className="servicenow-label block mb-1">
                        Region
                      </label>
                      <input 
                        type="text" 
                        className="servicenow-input w-full"
                        value={traveller.region}
                        onChange={(e) => updateTravellerField(traveller.id, 'region', e.target.value)}
                      />
                    </div>
                    
                    <div className="servicenow-form-group">
                      <label className="servicenow-label block mb-1">
                        Mobile Number
                      </label>
                      <input 
                        type="tel" 
                        className="servicenow-input w-full"
                        value={traveller.mobile}
                        onChange={(e) => updateTravellerField(traveller.id, 'mobile', e.target.value)}
                        placeholder="Enter mobile number"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.bookingOnBehalf && (
                <button 
                  type="button" 
                  className="servicenow-add-button flex items-center text-blue-600"
                  onClick={addTraveller}
                >
                  <span className="mr-1">+</span> Add another traveller
                </button>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 2. Travel Details */}
        <Collapsible open={expandedSections['purpose-dates']} onOpenChange={() => toggleSection('purpose-dates')}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
              <h2 className="text-lg font-medium">Travel Details</h2>
              <span>{expandedSections['purpose-dates'] ? '−' : '+'}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
            {/* Travel details form fields */}
          </CollapsibleContent>
        </Collapsible>

        {/* 3. Travel Requirements */}
        <Collapsible open={expandedSections['travel-requirements']} onOpenChange={() => toggleSection('travel-requirements')}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
              <h2 className="text-lg font-medium">Travel Requirements</h2>
              <span>{expandedSections['travel-requirements'] ? '−' : '+'}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
            {/* Travel requirements form fields */}
          </CollapsibleContent>
        </Collapsible>

        {/* 4. LAFHA Details */}
        <Collapsible open={expandedSections['lafha']} onOpenChange={() => toggleSection('lafha')}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
              <h2 className="text-lg font-medium">LAFHA Details</h2>
              <span>{expandedSections['lafha'] ? '−' : '+'}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
            {/* LAFHA form fields */}
          </CollapsibleContent>
        </Collapsible>

        {/* 5. Declarations */}
        <Collapsible open={expandedSections['declarations']} onOpenChange={() => toggleSection('declarations')}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
              <h2 className="text-lg font-medium">Declarations</h2>
              <span>{expandedSections['declarations'] ? '−' : '+'}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
            {/* Declaration checkboxes */}
          </CollapsibleContent>
        </Collapsible>

        {/* Submit Button */}
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
