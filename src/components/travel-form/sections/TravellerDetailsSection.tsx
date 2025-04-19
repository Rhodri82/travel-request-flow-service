
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TravelFormData, Section, Traveller } from '../../../types/travel';

interface TravellerDetailsSectionProps {
  formData: TravelFormData;
  updateFormData: (path: string, value: any) => void;
  expandedSections: Record<Section, boolean>;
  toggleSection: (section: Section) => void;
  formErrors: Record<string, string>;
}

export const TravellerDetailsSection = ({
  formData,
  updateFormData,
  expandedSections,
  toggleSection,
  formErrors
}: TravellerDetailsSectionProps) => {
  // Update specific traveller field
  const updateTravellerField = (id: string, field: keyof Traveller, value: string) => {
    const updatedTravellers = formData.travellers.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    );
    updateFormData('travellers', updatedTravellers);
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

  return (
    <Collapsible 
      open={expandedSections['traveller-details']} 
      onOpenChange={() => toggleSection('traveller-details')}
    >
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-medium">Traveller Information</h2>
          <span>{expandedSections['traveller-details'] ? '−' : '+'}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
        <div className="servicenow-section-content">
          <div className="servicenow-form-group mb-4">
            <label className="servicenow-label flex items-center">
              <input 
                type="checkbox" 
                className="servicenow-checkbox mr-2" 
                checked={formData.bookingOnBehalf}
                onChange={(e) => {
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
  );
};
