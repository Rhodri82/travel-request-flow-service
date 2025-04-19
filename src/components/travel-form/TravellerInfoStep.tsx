
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TravelFormData, Section, Traveller } from '../../types/travel';

interface TravellerInfoStepProps {
  formData: TravelFormData;
  updateFormData: (path: string, value: any) => void;
  toggleSection: (section: Section) => void;
  expandedSections: Record<Section, boolean>;
  formErrors: Record<string, string>;
}

const TravellerInfoStep = ({ 
  formData, 
  updateFormData, 
  toggleSection, 
  expandedSections,
  formErrors 
}: TravellerInfoStepProps) => {
  
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
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Traveller Information</h2>
      
      {/* 1. TRAVELLER DETAILS */}
      <div className="servicenow-section mb-6">
        <Collapsible 
          open={expandedSections['traveller-details']} 
          onOpenChange={() => toggleSection('traveller-details')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="servicenow-section-header">
              <span className={`servicenow-toggle-indicator ${expandedSections['traveller-details'] ? 'open' : ''}`}>
                1. TRAVELLER DETAILS
              </span>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
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
      </div>
      
      {/* 5. EMERGENCY CONTACT */}
      <div className="servicenow-section">
        <Collapsible 
          open={expandedSections['emergency-contact']} 
          onOpenChange={() => toggleSection('emergency-contact')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="servicenow-section-header">
              <span className={`servicenow-toggle-indicator ${expandedSections['emergency-contact'] ? 'open' : ''}`}>
                2. EMERGENCY CONTACT
              </span>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="servicenow-section-content">
              <div className="servicenow-form-group mb-4">
                <label className="servicenow-label flex items-center">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox mr-2" 
                    checked={formData.requireEmergencyContact}
                    onChange={(e) => updateFormData('requireEmergencyContact', e.target.checked)}
                  />
                  <span>Do you require an emergency contact?</span>
                </label>
              </div>
              
              {formData.requireEmergencyContact && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="servicenow-form-group">
                    <label className="servicenow-label block mb-1">Name</label>
                    <input 
                      type="text" 
                      className="servicenow-input w-full"
                      value={formData.emergencyContact.name}
                      onChange={(e) => updateFormData('emergencyContact.name', e.target.value)}
                    />
                    {formErrors['emergencyContact.name'] && (
                      <div className="servicenow-error mt-1">{formErrors['emergencyContact.name']}</div>
                    )}
                  </div>
                  
                  <div className="servicenow-form-group">
                    <label className="servicenow-label block mb-1">Phone</label>
                    <input 
                      type="text" 
                      className="servicenow-input w-full"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => updateFormData('emergencyContact.phone', e.target.value)}
                    />
                    {formErrors['emergencyContact.phone'] && (
                      <div className="servicenow-error mt-1">{formErrors['emergencyContact.phone']}</div>
                    )}
                  </div>
                  
                  <div className="servicenow-form-group">
                    <label className="servicenow-label block mb-1">Relationship</label>
                    <input 
                      type="text" 
                      className="servicenow-input w-full"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => updateFormData('emergencyContact.relationship', e.target.value)}
                    />
                    {formErrors['emergencyContact.relationship'] && (
                      <div className="servicenow-error mt-1">{formErrors['emergencyContact.relationship']}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default TravellerInfoStep;
