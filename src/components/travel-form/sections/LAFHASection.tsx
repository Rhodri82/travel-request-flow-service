import { useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { TravelFormData, Section, LAFHADetails } from '../../../types/travel';
import { LAFHA_RATES } from '../../../data/defaultFormData';

interface LAFHASectionProps {
  formData: TravelFormData;
  updateFormData: (path: string, value: any) => void;
  expandedSections: Record<Section, boolean>;
  toggleSection: (section: Section) => void;
  formErrors: Record<string, string>;
}

export const LAFHASection = ({
  formData,
  updateFormData,
  expandedSections,
  toggleSection,
  formErrors
}: LAFHASectionProps) => {
  
  // Determine LAFHA eligibility and classification
  useEffect(() => {
    if (formData.requireAccommodation &&
      (formData.accommodation.type === 'private' || formData.accommodation.type === 'other')) {
      // Auto-enable LAFHA for private or other accommodation types
      if (!formData.isPersonalTravel && formData.lafha.length === 0) {
        // Calculate default LAFHA based on type and duration
        const defaultRate = formData.accommodation.type === 'private' 
          ? LAFHA_RATES['Private (OR23)'] 
          : LAFHA_RATES['Employee-arranged (OR24)'];
        
        const defaultCategory = formData.accommodation.type === 'private' 
          ? 'Private (OR23)' 
          : 'Employee-arranged (OR24)';
        
        // Calculate SAP code based on nights
        let sapCode = 'LAFHA';
        if (formData.nights > 21) {
          sapCode = 'LAFHA - FBT applies';
        } else if (formData.nights <= 21) {
          sapCode = 'Travel Allowance - PAYGW';
        }
        
        // Set LAFHA details if none exist yet
        updateFormData('requireLAFHA', true);
        updateFormData('lafha', [{
          id: Date.now().toString(),
          category: defaultCategory,
          rate: defaultRate,
          days: formData.nights || 1,
          sapCode: sapCode
        }]);
      }
    }
  }, [formData.accommodation, formData.requireAccommodation, formData.nights, formData.isPersonalTravel]);

  // Add LAFHA entry
  const addLAFHA = () => {
    // Calculate SAP code based on nights
    let sapCode = 'LAFHA';
    if (formData.nights > 21) {
      sapCode = 'LAFHA - FBT applies';
    } else if (formData.nights <= 21) {
      sapCode = 'Travel Allowance - PAYGW';
    }
    
    const newLAFHA: LAFHADetails = {
      id: Date.now().toString(),
      category: 'Full Day (OR03)',
      rate: LAFHA_RATES['Full Day (OR03)'],
      days: formData.nights || 1, // Default to 1 if nights is 0
      sapCode: sapCode
    };
    
    updateFormData('lafha', [...formData.lafha, newLAFHA]);
  };

  // Remove LAFHA entry
  const removeLAFHA = (id: string) => {
    const updatedLafha = formData.lafha.filter(item => item.id !== id);
    updateFormData('lafha', updatedLafha);
    
    // If no LAFHA entries left, disable LAFHA requirement
    if (updatedLafha.length === 0) {
      updateFormData('requireLAFHA', false);
    }
  };

  // Update LAFHA entry
  const updateLAFHA = (id: string, field: keyof LAFHADetails, value: any) => {
    const updatedLafha = formData.lafha.map(item => {
      if (item.id === id) {
        // If updating category, also update the rate
        if (field === 'category' && typeof value === 'string') {
          return {
            ...item,
            category: value,
            rate: LAFHA_RATES[value as keyof typeof LAFHA_RATES] || item.rate
          };
        } else {
          return {
            ...item,
            [field]: field === 'rate' || field === 'days' ? Number(value) : value
          };
        }
      }
      return item;
    });
    
    updateFormData('lafha', updatedLafha);
  };

  // Calculate total LAFHA amount
  const calculateTotalLAFHA = (): number => {
    return formData.lafha.reduce((total, item) => total + (item.rate * item.days), 0);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">LAFHA & Allowances</h2>
      
      {/* 4. LAFHA */}
      <div className="servicenow-section">
        <Collapsible 
          open={expandedSections['lafha']} 
          onOpenChange={() => toggleSection('lafha')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
              <h2 className="text-lg font-medium">LAFHA & Allowances</h2>
              <span>{expandedSections['lafha'] ? '−' : '+'}</span>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
            <div className="servicenow-section-content">
              {formData.isPersonalTravel ? (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
                  <p className="text-amber-800">
                    <strong>Note:</strong> LAFHA is not available for trips with personal travel components.
                  </p>
                </div>
              ) : (
                <>
                  <div className="servicenow-form-group mb-4">
                    <label className="servicenow-label flex items-center">
                      <input 
                        type="checkbox" 
                        className="servicenow-checkbox mr-2" 
                        checked={formData.requireLAFHA}
                        onChange={(e) => {
                          updateFormData('requireLAFHA', e.target.checked);
                          if (!e.target.checked) {
                            updateFormData('lafha', []);
                          }
                        }}
                        disabled={formData.isPersonalTravel}
                      />
                      <span>Do you require LAFHA?</span>
                    </label>
                    
                    {formData.nights > 21 && formData.requireLAFHA && (
                      <div className="mt-2 text-amber-600 text-sm">
                        Warning: Trip exceeds 21 nights - FBT implications may apply
                      </div>
                    )}
                  </div>
                  
                  {formData.requireLAFHA && (
                    <>
                      {formErrors.lafha && (
                        <div className="servicenow-error mb-4">{formErrors.lafha}</div>
                      )}
                      
                      {formData.lafha.length === 0 ? (
                        <div className="text-gray-500 mb-4">No LAFHA entries added yet</div>
                      ) : (
                        formData.lafha.map((item) => (
                          <div key={item.id} className="servicenow-repeatable-block mb-4 p-4 border border-gray-200 rounded relative">
                            <button 
                              type="button" 
                              className="servicenow-remove-button absolute top-2 right-2 text-red-500"
                              onClick={() => removeLAFHA(item.id)}
                            >
                              ✕
                            </button>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="servicenow-form-group">
                                <label className="servicenow-label servicenow-required block mb-1">Category</label>
                                <select 
                                  className="servicenow-select w-full"
                                  value={item.category}
                                  onChange={(e) => updateLAFHA(item.id, 'category', e.target.value)}
                                  required
                                >
                                  <option value="">Select category</option>
                                  {Object.keys(LAFHA_RATES).map(rate => (
                                    <option key={rate} value={rate}>{rate}</option>
                                  ))}
                                </select>
                                {formErrors[`lafha.category`] && (
                                  <div className="servicenow-error mt-1">{formErrors[`lafha.category`]}</div>
                                )}
                              </div>
                              
                              <div className="servicenow-form-group">
                                <label className="servicenow-label block mb-1">SAP Code</label>
                                <input 
                                  type="text" 
                                  className="servicenow-input servicenow-readonly w-full"
                                  value={item.sapCode || ''}
                                  readOnly
                                />
                                <div className="servicenow-helper-text text-sm text-gray-500 mt-1">
                                  Auto-determined based on stay length
                                </div>
                              </div>
                              
                              <div className="servicenow-form-group">
                                <label className="servicenow-label servicenow-required block mb-1">Rate ($)</label>
                                <input 
                                  type="number" 
                                  className="servicenow-input w-full"
                                  step="0.01"
                                  value={item.rate}
                                  onChange={(e) => updateLAFHA(item.id, 'rate', e.target.value)}
                                  required
                                />
                                {formErrors[`lafha.rate`] && (
                                  <div className="servicenow-error mt-1">{formErrors[`lafha.rate`]}</div>
                                )}
                              </div>
                              
                              <div className="servicenow-form-group">
                                <label className="servicenow-label servicenow-required block mb-1">Days</label>
                                <input 
                                  type="number" 
                                  className="servicenow-input w-full"
                                  min="1"
                                  value={item.days}
                                  onChange={(e) => updateLAFHA(item.id, 'days', e.target.value)}
                                  required
                                />
                                {formErrors[`lafha.days`] && (
                                  <div className="servicenow-error mt-1">{formErrors[`lafha.days`]}</div>
                                )}
                              </div>
                              
                              <div className="servicenow-form-group md:col-span-2">
                                <div className="servicenow-calculator p-2 bg-gray-50 rounded border text-right">
                                  <span className="mr-2">Total:</span>
                                  <span className="font-semibold">${(item.rate * item.days).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      
                      <button 
                        type="button" 
                        className="servicenow-add-button flex items-center text-blue-600 mb-4"
                        onClick={addLAFHA}
                      >
                        <span className="mr-1">+</span> Add another LAFHA entry
                      </button>
                      
                      {/* Meal declarations section */}
                      {formData.lafha.some(item => 
                        item.category === 'Breakfast' || 
                        item.category === 'Lunch' || 
                        item.category === 'Dinner'
                      ) && (
                        <div className="mt-4 p-4 border border-gray-200 rounded">
                          <h4 className="font-semibold mb-2">Meal Declarations</h4>
                          <p className="text-gray-600 mb-4">Please confirm the following for your meal allowance claims:</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-start">
                              <Checkbox id="meal-declaration-1" className="mt-1 mr-2" />
                              <label htmlFor="meal-declaration-1" className="text-sm">
                                I confirm these meals were consumed during work-related travel and were not provided by the accommodation or included in any other costs claimed.
                              </label>
                            </div>
                            
                            <div className="flex items-start">
                              <Checkbox id="meal-declaration-2" className="mt-1 mr-2" />
                              <label htmlFor="meal-declaration-2" className="text-sm">
                                I understand that meal allowances are taxable and will be processed through payroll.
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Remote area classification */}
                      {formData.requireLAFHA && formData.lafha.length > 0 && (
                        <div className="mt-4 p-4 border border-gray-200 rounded">
                          <h4 className="font-semibold mb-2">Location Classification</h4>
                          <p className="text-gray-600 mb-4">Is the accommodation location in a remote area?</p>
                          
                          <RadioGroup defaultValue="non-remote" className="space-y-2">
                            <div className="flex items-center">
                              <RadioGroupItem value="non-remote" id="non-remote" className="mr-2" />
                              <label htmlFor="non-remote">Non-remote location</label>
                            </div>
                            <div className="flex items-center">
                              <RadioGroupItem value="remote" id="remote" className="mr-2" />
                              <label htmlFor="remote">Remote location (special rates apply)</label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Cost Summary */}
              <div className="mt-6">
                <h3 className="font-medium mb-3">Cost Summary</h3>
                
                <div className="servicenow-summary p-4 bg-gray-50 rounded border">
                  {formData.lafha.length > 0 ? (
                    <>
                      <div className="servicenow-summary-title font-semibold mb-2">LAFHA Breakdown</div>
                      
                      <table className="w-full mb-3">
                        <thead className="text-left">
                          <tr className="border-b">
                            <th className="pb-2">Category</th>
                            <th className="pb-2">Rate</th>
                            <th className="pb-2">Days</th>
                            <th className="pb-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.lafha.map((item) => (
                            <tr key={item.id} className="border-b border-gray-100">
                              <td className="py-2">{item.category}</td>
                              <td className="py-2">${item.rate.toFixed(2)}</td>
                              <td className="py-2">{item.days}</td>
                              <td className="py-2 text-right">${(item.rate * item.days).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="pt-2 text-right font-semibold">Total LAFHA</td>
                            <td className="pt-2 text-right font-semibold">${calculateTotalLAFHA().toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                      
                      {formData.nights > 21 && (
                        <div className="text-amber-600 text-sm">
                          <strong>Note:</strong> Stay exceeds 21 nights - FBT implications may apply
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">No LAFHA entries to display</p>
                  )}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
