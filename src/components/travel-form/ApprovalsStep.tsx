
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TravelFormData, Section } from '../../types/travel';

interface ApprovalsStepProps {
  formData: TravelFormData;
  updateFormData: (path: string, value: any) => void;
  toggleSection: (section: Section) => void;
  expandedSections: Record<Section, boolean>;
  formErrors: Record<string, string>;
  handleSubmit: (e: React.FormEvent) => void;
}

const ApprovalsStep = ({
  formData,
  updateFormData,
  toggleSection,
  expandedSections,
  formErrors,
  handleSubmit
}: ApprovalsStepProps) => {
  
  // Calculate total LAFHA amount
  const calculateTotalLAFHA = (): number => {
    return formData.lafha.reduce((total, item) => total + (item.rate * item.days), 0);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Approvals & Declarations</h2>
      
      {/* COST PREVIEW */}
      <div className="servicenow-section mb-6">
        <Collapsible 
          open={expandedSections['cost-preview']} 
          onOpenChange={() => toggleSection('cost-preview')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="servicenow-section-header">
              <span className={`servicenow-toggle-indicator ${expandedSections['cost-preview'] ? 'open' : ''}`}>
                1. COST PREVIEW
              </span>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="servicenow-section-content">
              <div className="servicenow-form-group mb-4">
                <label className="servicenow-label block mb-1">Total Cost Estimate</label>
                <input 
                  type="text" 
                  className="servicenow-input servicenow-readonly w-full"
                  value={`$${calculateTotalLAFHA().toFixed(2)}`}
                  readOnly
                />
                <div className="servicenow-helper-text text-sm text-gray-500 mt-1">
                  This is an estimate based on LAFHA allowances. Actual costs may vary.
                </div>
              </div>
              
              {formData.lafha.length > 0 && (
                <div className="servicenow-cost-breakdown mt-4">
                  <h4 className="font-medium mb-2">LAFHA Breakdown</h4>
                  <table className="w-full">
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
                      <tr className="font-semibold">
                        <td colSpan={3} className="pt-2 text-right">Total LAFHA</td>
                        <td className="pt-2 text-right">${calculateTotalLAFHA().toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      {/* DECLARATIONS */}
      <div className="servicenow-section">
        <Collapsible 
          open={expandedSections['declarations']} 
          onOpenChange={() => toggleSection('declarations')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="servicenow-section-header">
              <span className={`servicenow-toggle-indicator ${expandedSections['declarations'] ? 'open' : ''}`}>
                2. DECLARATIONS
              </span>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="servicenow-section-content">
              {formErrors.declarations && (
                <div className="servicenow-error mb-4">{formErrors.declarations}</div>
              )}
              
              <div className="servicenow-form-group mb-3">
                <label className="servicenow-label flex items-start">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox mt-1 mr-2" 
                    checked={formData.declarations.correctAndApproved}
                    onChange={(e) => updateFormData('declarations.correctAndApproved', e.target.checked)}
                  />
                  <span>I have read and understood the terms and conditions of this form and confirm that all information provided is accurate and complete.</span>
                </label>
              </div>
              
              <div className="servicenow-form-group mb-3">
                <label className="servicenow-label flex items-start">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox mt-1 mr-2" 
                    checked={formData.declarations.payrollDeduction}
                    onChange={(e) => updateFormData('declarations.payrollDeduction', e.target.checked)}
                  />
                  <span>I understand that any personally incurred expenses during this business travel will be subject to payroll deduction if not properly substantiated.</span>
                </label>
              </div>
              
              <div className="servicenow-form-group mb-3">
                <label className="servicenow-label flex items-start">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox mt-1 mr-2" 
                    checked={formData.declarations.audit}
                    onChange={(e) => updateFormData('declarations.audit', e.target.checked)}
                  />
                  <span>I understand that my travel expenses may be subject to audit, and I will retain all receipts and supporting documentation for a minimum of 7 years.</span>
                </label>
              </div>
              
              <div className="servicenow-form-group mb-3">
                <label className="servicenow-label flex items-start">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox mt-1 mr-2" 
                    checked={formData.declarations.ctmBookings}
                    onChange={(e) => updateFormData('declarations.ctmBookings', e.target.checked)}
                  />
                  <span>I understand that all travel bookings will be made through our corporate travel management system (CTM) and I will not make independent bookings without prior approval.</span>
                </label>
              </div>
              
              <div className="servicenow-form-group mb-3">
                <label className="servicenow-label flex items-start">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox mt-1 mr-2" 
                    checked={formData.declarations.noPersonalCards}
                    onChange={(e) => updateFormData('declarations.noPersonalCards', e.target.checked)}
                  />
                  <span>I understand that personal credit cards should not be used for business expenses related to this travel, and any exceptions must be documented and pre-approved.</span>
                </label>
              </div>
              
              <div className="mt-6">
                <button 
                  type="button"
                  className="servicenow-button"
                  onClick={handleSubmit}
                >
                  Submit Travel Request
                </button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default ApprovalsStep;
