
import { CheckCircle, Circle, AlertTriangle } from "lucide-react";
import { FormStep, TravelFormData } from "../../types/travel";

interface TravelFormSidebarProps {
  currentStep: FormStep;
  setCurrentStep: (step: FormStep) => void;
  formData: TravelFormData;
}

const TravelFormSidebar = ({ currentStep, setCurrentStep, formData }: TravelFormSidebarProps) => {
  // Check if traveller info is complete
  const isTravellerInfoComplete = () => {
    const primaryTraveller = formData.travellers[0];
    return (
      primaryTraveller.fullName !== '' && 
      primaryTraveller.employeeId !== '' && 
      primaryTraveller.costCentre !== ''
    );
  };

  // Check if travel details are complete
  const isTravelDetailsComplete = () => {
    return (
      formData.purpose !== '' && 
      formData.travelType !== '' && 
      formData.fromDate !== '' && 
      formData.toDate !== '' && 
      formData.destination !== ''
    );
  };

  // Check if LAFHA details are complete (only if LAFHA is required)
  const isLAFHAComplete = () => {
    if (!formData.requireLAFHA) return true;
    return formData.lafha.length > 0;
  };

  // Check if declarations are complete
  const isDeclarationsComplete = () => {
    return Object.values(formData.declarations).every(Boolean);
  };

  // Get the status icon for a step
  const getStatusIcon = (step: FormStep) => {
    // Determine if step is complete
    let isComplete = false;
    
    switch(step) {
      case 'traveller-info':
        isComplete = isTravellerInfoComplete();
        break;
      case 'travel-details':
        isComplete = isTravelDetailsComplete();
        break;
      case 'lafha':
        isComplete = isLAFHAComplete();
        break;
      case 'approvals':
        isComplete = isDeclarationsComplete();
        break;
    }
    
    // Current step is active
    if (step === currentStep) {
      return <Circle className="w-5 h-5 text-blue-500" />;
    }
    
    // Completed step
    if (isComplete) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    // Incomplete step
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div className="servicenow-sidebar bg-gray-50 rounded-md shadow p-4">
      <h2 className="font-semibold text-lg mb-4">Form Progress</h2>
      
      <div className="space-y-2">
        <button 
          className={`w-full text-left py-2 px-3 rounded ${currentStep === 'traveller-info' ? 'bg-blue-50 text-blue-600' : ''}`}
          onClick={() => setCurrentStep('traveller-info')}
        >
          <div className="flex items-center gap-2">
            {getStatusIcon('traveller-info')}
            <span>1. Traveller Information</span>
          </div>
        </button>
        
        <button 
          className={`w-full text-left py-2 px-3 rounded ${currentStep === 'travel-details' ? 'bg-blue-50 text-blue-600' : ''}`}
          onClick={() => setCurrentStep('travel-details')}
        >
          <div className="flex items-center gap-2">
            {getStatusIcon('travel-details')}
            <span>2. Travel Details & Bookings</span>
          </div>
        </button>
        
        <button 
          className={`w-full text-left py-2 px-3 rounded ${currentStep === 'lafha' ? 'bg-blue-50 text-blue-600' : ''}`}
          onClick={() => setCurrentStep('lafha')}
        >
          <div className="flex items-center gap-2">
            {getStatusIcon('lafha')}
            <span>3. LAFHA & Allowances</span>
          </div>
        </button>
        
        <button 
          className={`w-full text-left py-2 px-3 rounded ${currentStep === 'approvals' ? 'bg-blue-50 text-blue-600' : ''}`}
          onClick={() => setCurrentStep('approvals')}
        >
          <div className="flex items-center gap-2">
            {getStatusIcon('approvals')}
            <span>4. Approvals & Declarations</span>
          </div>
        </button>
      </div>
      
      {/* Cost summary */}
      <div className="mt-6 border-t pt-4">
        <h3 className="font-semibold mb-2">Cost Summary</h3>
        <div className="bg-white p-3 rounded border">
          {formData.lafha.length > 0 ? (
            <div>
              <p className="font-medium">LAFHA Total:</p>
              <p className="text-lg">${formData.lafha.reduce((total, item) => total + (item.rate * item.days), 0).toFixed(2)}</p>
            </div>
          ) : (
            <p className="text-gray-500">No costs calculated yet</p>
          )}
        </div>
      </div>
      
      {/* Mobile collapse button */}
      <div className="mt-4 lg:hidden">
        <button 
          className="servicenow-button-secondary w-full"
          onClick={() => {}}
        >
          Toggle Sidebar
        </button>
      </div>
    </div>
  );
};

export default TravelFormSidebar;
