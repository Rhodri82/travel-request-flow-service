
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TravelFormData, Section } from '../../../types/travel';

interface DeclarationsSectionProps {
  formData: TravelFormData;
  updateFormData: (path: string, value: any) => void;
  expandedSections: Record<Section, boolean>;
  toggleSection: (section: Section) => void;
  formErrors: Record<string, string>;
}

export const DeclarationsSection = ({
  formData,
  updateFormData,
  expandedSections,
  toggleSection,
  formErrors
}: DeclarationsSectionProps) => {
  // Calculate total LAFHA amount
  const calculateTotalLAFHA = (): number => {
    return formData.lafha.reduce((total, item) => total + (item.rate * item.days), 0);
  };
  
  return (
    <div className="servicenow-section">
      <Collapsible 
        open={expandedSections['declarations']} 
        onOpenChange={() => toggleSection('declarations')}
      >
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-medium">Declarations</h2>
            <span>{expandedSections['declarations'] ? '−' : '+'}</span>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
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
  );
};
