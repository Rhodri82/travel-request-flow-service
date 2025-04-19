
import { useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TravelFormData, Section, FlightLeg, Ferry } from '../../types/travel';

interface TravelDetailsStepProps {
  formData: TravelFormData;
  updateFormData: (path: string, value: any) => void;
  toggleSection: (section: Section) => void;
  expandedSections: Record<Section, boolean>;
  formErrors: Record<string, string>;
  calculateNights: () => void;
}

const TravelDetailsStep = ({ 
  formData, 
  updateFormData, 
  toggleSection, 
  expandedSections,
  formErrors,
  calculateNights
}: TravelDetailsStepProps) => {
  
  // Calculate nights when dates change
  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      calculateNights();
    }
  }, [formData.fromDate, formData.toDate]);

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
    
    updateFormData('flightLegs', [...formData.flightLegs, newLeg]);
  };

  // Remove a flight leg
  const removeFlightLeg = (id: string) => {
    updateFormData('flightLegs', formData.flightLegs.filter(leg => leg.id !== id));
  };

  // Update specific flight leg field
  const updateFlightLegField = (id: string, field: keyof FlightLeg, value: string) => {
    const updatedLegs = formData.flightLegs.map(leg => 
      leg.id === id ? { ...leg, [field]: value } : leg
    );
    
    updateFormData('flightLegs', updatedLegs);
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
    
    updateFormData('ferries', [...formData.ferries, newFerry]);
  };

  // Remove a ferry request
  const removeFerry = (id: string) => {
    updateFormData('ferries', formData.ferries.filter(ferry => ferry.id !== id));
  };

  // Update specific ferry field
  const updateFerryField = (id: string, field: keyof Ferry, value: string) => {
    const updatedFerries = formData.ferries.map(ferry => 
      ferry.id === id ? { ...ferry, [field]: value } : ferry
    );
    
    updateFormData('ferries', updatedFerries);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Travel Details & Bookings</h2>
      
      {/* 2. PURPOSE AND DATES */}
      <div className="servicenow-section mb-6">
        <Collapsible 
          open={expandedSections['purpose-dates']} 
          onOpenChange={() => toggleSection('purpose-dates')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="servicenow-section-header">
              <span className={`servicenow-toggle-indicator ${expandedSections['purpose-dates'] ? 'open' : ''}`}>
                1. PURPOSE AND DATES
              </span>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="servicenow-section-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="servicenow-form-group md:col-span-2">
                  <label className="servicenow-label servicenow-required block mb-1">Reason for travel</label>
                  <input 
                    type="text" 
                    className="servicenow-input w-full"
                    value={formData.purpose}
                    onChange={(e) => updateFormData('purpose', e.target.value)}
                    required
                  />
                  {formErrors.purpose && (
                    <div className="servicenow-error mt-1">{formErrors.purpose}</div>
                  )}
                </div>
                
                <div className="servicenow-form-group">
                  <label className="servicenow-label servicenow-required block mb-1">From Date</label>
                  <input 
                    type="date" 
                    className="servicenow-input w-full"
                    value={formData.fromDate}
                    onChange={(e) => updateFormData('fromDate', e.target.value)}
                    required
                  />
                  {formErrors.fromDate && (
                    <div className="servicenow-error mt-1">{formErrors.fromDate}</div>
                  )}
                </div>
                
                <div className="servicenow-form-group">
                  <label className="servicenow-label servicenow-required block mb-1">To Date</label>
                  <input 
                    type="date" 
                    className="servicenow-input w-full"
                    value={formData.toDate}
                    onChange={(e) => updateFormData('toDate', e.target.value)}
                    required
                  />
                  {formErrors.toDate && (
                    <div className="servicenow-error mt-1">{formErrors.toDate}</div>
                  )}
                </div>
                
                <div className="servicenow-form-group">
                  <label className="servicenow-label servicenow-required block mb-1">Destination</label>
                  <input 
                    type="text" 
                    className="servicenow-input w-full"
                    value={formData.destination}
                    onChange={(e) => updateFormData('destination', e.target.value)}
                    required
                  />
                  {formErrors.destination && (
                    <div className="servicenow-error mt-1">{formErrors.destination}</div>
                  )}
                </div>
                
                <div className="servicenow-form-group">
                  <label className="servicenow-label block mb-1">Number of nights</label>
                  <input 
                    type="number" 
                    className="servicenow-input servicenow-readonly w-full"
                    value={formData.nights}
                    readOnly
                  />
                  <div className="servicenow-helper-text text-sm text-gray-500 mt-1">Automatically calculated from dates</div>
                </div>
                
                <div className="servicenow-form-group">
                  <label className="servicenow-label servicenow-required block mb-1">Travel Type</label>
                  <select 
                    className="servicenow-select w-full"
                    value={formData.travelType}
                    onChange={(e) => updateFormData('travelType', e.target.value)}
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
                    <div className="servicenow-error mt-1">{formErrors.travelType}</div>
                  )}
                </div>
                
                <div className="servicenow-form-group">
                  <label className="servicenow-label flex items-center">
                    <input 
                      type="checkbox" 
                      className="servicenow-checkbox mr-2" 
                      checked={formData.isPersonalTravel}
                      onChange={(e) => {
                        updateFormData('isPersonalTravel', e.target.checked);
                        // If personal travel, disable LAFHA
                        if (e.target.checked) {
                          updateFormData('requireLAFHA', false);
                          updateFormData('lafha', []);
                        }
                      }}
                    />
                    <span>Personal travel component included</span>
                  </label>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      {/* 3. TRAVEL REQUIREMENTS */}
      <div className="servicenow-section">
        <Collapsible 
          open={expandedSections['travel-requirements']} 
          onOpenChange={() => toggleSection('travel-requirements')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="servicenow-section-header">
              <span className={`servicenow-toggle-indicator ${expandedSections['travel-requirements'] ? 'open' : ''}`}>
                2. TRAVEL REQUIREMENTS
              </span>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="servicenow-section-content">
              {/* Flights */}
              <div className="servicenow-form-group border-b pb-4 mb-4">
                <label className="servicenow-label font-semibold flex items-center">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox mr-2" 
                    checked={formData.requireFlights}
                    onChange={(e) => {
                      updateFormData('requireFlights', e.target.checked);
                      if (!e.target.checked) {
                        updateFormData('flightLegs', []);
                        updateFormData('returnFlight', false);
                      }
                    }}
                  />
                  <span>Flights Required</span>
                </label>
                
                {formData.requireFlights && (
                  <div className="mt-4">
                    {formErrors.flightLegs && (
                      <div className="servicenow-error mb-2">{formErrors.flightLegs}</div>
                    )}
                    
                    {formData.flightLegs.length === 0 ? (
                      <div className="text-gray-500 mb-2">No flight legs added yet</div>
                    ) : (
                      formData.flightLegs.map((leg, index) => (
                        <div key={leg.id} className="servicenow-repeatable-block mb-4 p-4 border border-gray-200 rounded relative">
                          <button 
                            type="button" 
                            className="servicenow-remove-button absolute top-2 right-2 text-red-500"
                            onClick={() => removeFlightLeg(leg.id)}
                          >
                            ✕
                          </button>
                          
                          <h4 className="font-medium mb-3">Flight Leg {index + 1}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="servicenow-form-group">
                              <label className="servicenow-label servicenow-required block mb-1">From</label>
                              <input 
                                type="text" 
                                className="servicenow-input w-full"
                                placeholder="Airport code or city"
                                value={leg.from}
                                onChange={(e) => updateFlightLegField(leg.id, 'from', e.target.value)}
                                required
                              />
                              {formErrors[`flightLegs[${index}].from`] && (
                                <div className="servicenow-error mt-1">{formErrors[`flightLegs[${index}].from`]}</div>
                              )}
                            </div>
                            
                            <div className="servicenow-form-group">
                              <label className="servicenow-label servicenow-required block mb-1">To</label>
                              <input 
                                type="text" 
                                className="servicenow-input w-full"
                                placeholder="Airport code or city"
                                value={leg.to}
                                onChange={(e) => updateFlightLegField(leg.id, 'to', e.target.value)}
                                required
                              />
                              {formErrors[`flightLegs[${index}].to`] && (
                                <div className="servicenow-error mt-1">{formErrors[`flightLegs[${index}].to`]}</div>
                              )}
                            </div>
                            
                            <div className="servicenow-form-group">
                              <label className="servicenow-label servicenow-required block mb-1">Date</label>
                              <input 
                                type="date" 
                                className="servicenow-input w-full"
                                value={leg.date}
                                onChange={(e) => updateFlightLegField(leg.id, 'date', e.target.value)}
                                required
                              />
                              {formErrors[`flightLegs[${index}].date`] && (
                                <div className="servicenow-error mt-1">{formErrors[`flightLegs[${index}].date`]}</div>
                              )}
                            </div>
                            
                            <div className="servicenow-form-group">
                              <label className="servicenow-label block mb-1">Preferred Time</label>
                              <input 
                                type="time" 
                                className="servicenow-input w-full"
                                value={leg.time}
                                onChange={(e) => updateFlightLegField(leg.id, 'time', e.target.value)}
                              />
                            </div>
                            
                            <div className="servicenow-form-group md:col-span-2">
                              <label className="servicenow-label block mb-1">Airline Preference</label>
                              <input 
                                type="text" 
                                className="servicenow-input w-full"
                                value={leg.airlinePreference}
                                onChange={(e) => updateFlightLegField(leg.id, 'airlinePreference', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    <button 
                      type="button" 
                      className="servicenow-add-button flex items-center text-blue-600 mb-4"
                      onClick={addFlightLeg}
                    >
                      <span className="mr-1">+</span> Add another leg
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="servicenow-form-group">
                        <label className="servicenow-label flex items-center">
                          <input 
                            type="checkbox" 
                            className="servicenow-checkbox mr-2" 
                            checked={formData.returnFlight}
                            onChange={(e) => updateFormData('returnFlight', e.target.checked)}
                          />
                          <span>Return flight required?</span>
                        </label>
                      </div>
                      
                      <div className="servicenow-form-group">
                        <label className="servicenow-label block mb-1">Baggage Preference</label>
                        <select 
                          className="servicenow-select w-full"
                          value={formData.baggage}
                          onChange={(e) => updateFormData('baggage', e.target.value)}
                        >
                          <option value="carry-on">Carry-on only</option>
                          <option value="checked">Checked baggage</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ferry */}
              <div className="servicenow-form-group border-b pb-4 mb-4">
                <label className="servicenow-label font-semibold flex items-center">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox mr-2"
                    checked={formData.requireFerry}
                    onChange={(e) => {
                      updateFormData('requireFerry', e.target.checked);
                      if (!e.target.checked) {
                        updateFormData('ferries', []);
                      }
                    }}
                  />
                  <span>Ferry Required</span>
                </label>
                
                {formData.requireFerry && (
                  <div className="mt-4">
                    {formErrors.ferries && (
                      <div className="servicenow-error mb-2">{formErrors.ferries}</div>
                    )}
                    
                    {formData.ferries.length === 0 ? (
                      <div className="text-gray-500 mb-2">No ferry bookings added yet</div>
                    ) : (
                      formData.ferries.map((ferry, index) => (
                        <div key={ferry.id} className="servicenow-repeatable-block mb-4 p-4 border border-gray-200 rounded relative">
                          <button 
                            type="button" 
                            className="servicenow-remove-button absolute top-2 right-2 text-red-500"
                            onClick={() => removeFerry(ferry.id)}
                          >
                            ✕
                          </button>
                          
                          <h4 className="font-medium mb-3">Ferry {index + 1}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="servicenow-form-group">
                              <label className="servicenow-label servicenow-required block mb-1">From</label>
                              <input 
                                type="text" 
                                className="servicenow-input w-full"
                                value={ferry.from}
                                onChange={(e) => updateFerryField(ferry.id, 'from', e.target.value)}
                                required
                              />
                              {formErrors[`ferries[${index}].from`] && (
                                <div className="servicenow-error mt-1">{formErrors[`ferries[${index}].from`]}</div>
                              )}
                            </div>
                            
                            <div className="servicenow-form-group">
                              <label className="servicenow-label servicenow-required block mb-1">To</label>
                              <input 
                                type="text" 
                                className="servicenow-input w-full"
                                value={ferry.to}
                                onChange={(e) => updateFerryField(ferry.id, 'to', e.target.value)}
                                required
                              />
                              {formErrors[`ferries[${index}].to`] && (
                                <div className="servicenow-error mt-1">{formErrors[`ferries[${index}].to`]}</div>
                              )}
                            </div>
                            
                            <div className="servicenow-form-group">
                              <label className="servicenow-label servicenow-required block mb-1">Date</label>
                              <input 
                                type="date" 
                                className="servicenow-input w-full"
                                value={ferry.date}
                                onChange={(e) => updateFerryField(ferry.id, 'date', e.target.value)}
                                required
                              />
                              {formErrors[`ferries[${index}].date`] && (
                                <div className="servicenow-error mt-1">{formErrors[`ferries[${index}].date`]}</div>
                              )}
                            </div>
                            
                            <div className="servicenow-form-group">
                              <label className="servicenow-label block mb-1">Time</label>
                              <input 
                                type="time" 
                                className="servicenow-input w-full"
                                value={ferry.time}
                                onChange={(e) => updateFerryField(ferry.id, 'time', e.target.value)}
                              />
                            </div>
                            
                            <div className="servicenow-form-group md:col-span-2">
                              <label className="servicenow-label block mb-1">Notes</label>
                              <textarea 
                                className="servicenow-textarea w-full"
                                value={ferry.notes}
                                onChange={(e) => updateFerryField(ferry.id, 'notes', e.target.value)}
                                placeholder="Vehicle details, etc."
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    <button 
                      type="button" 
                      className="servicenow-add-button flex items-center text-blue-600"
                      onClick={addFerry}
                    >
                      <span className="mr-1">+</span> Add another ferry
                    </button>
                  </div>
                )}
              </div>

              {/* Car Hire */}
              <div className="servicenow-form-group border-b pb-4 mb-4">
                <label className="servicenow-label font-semibold flex items-center">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox mr-2" 
                    checked={formData.requireCarHire}
                    onChange={(e) => {
                      updateFormData('requireCarHire', e.target.checked);
                      
                      // Reset car hire data if unchecked
                      if (!e.target.checked) {
                        updateFormData('carHire', {
                          pickupLocation: '',
                          pickupDate: '',
                          dropoffLocation: '',
                          dropoffDate: '',
                          carType: 'small',
                          shared: false,
                          sharedWith: ''
                        });
                      }
                    }}
                  />
                  <span>Car Hire Required</span>
                </label>
                
                {formData.requireCarHire && (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="servicenow-form-group">
                        <label className="servicenow-label servicenow-required block mb-1">Pickup Location</label>
                        <input 
                          type="text" 
                          className="servicenow-input w-full"
                          value={formData.carHire.pickupLocation}
                          onChange={(e) => updateFormData('carHire.pickupLocation', e.target.value)}
                          required
                        />
                        {formErrors['carHire.pickupLocation'] && (
                          <div className="servicenow-error mt-1">{formErrors['carHire.pickupLocation']}</div>
                        )}
                      </div>
                      
                      <div className="servicenow-form-group">
                        <label className="servicenow-label servicenow-required block mb-1">Pickup Date</label>
                        <input 
                          type="date" 
                          className="servicenow-input w-full"
                          value={formData.carHire.pickupDate}
                          onChange={(e) => updateFormData('carHire.pickupDate', e.target.value)}
                          required
                        />
                        {formErrors['carHire.pickupDate'] && (
                          <div className="servicenow-error mt-1">{formErrors['carHire.pickupDate']}</div>
                        )}
                      </div>
                      
                      <div className="servicenow-form-group">
                        <label className="servicenow-label servicenow-required block mb-1">Drop-off Location</label>
                        <input 
                          type="text" 
                          className="servicenow-input w-full"
                          value={formData.carHire.dropoffLocation}
                          onChange={(e) => updateFormData('carHire.dropoffLocation', e.target.value)}
                          required
                        />
                        {formErrors['carHire.dropoffLocation'] && (
                          <div className="servicenow-error mt-1">{formErrors['carHire.dropoffLocation']}</div>
                        )}
                      </div>
                      
                      <div className="servicenow-form-group">
                        <label className="servicenow-label servicenow-required block mb-1">Drop-off Date</label>
                        <input 
                          type="date" 
                          className="servicenow-input w-full"
                          value={formData.carHire.dropoffDate}
                          onChange={(e) => updateFormData('carHire.dropoffDate', e.target.value)}
                          required
                        />
                        {formErrors['carHire.dropoffDate'] && (
                          <div className="servicenow-error mt-1">{formErrors['carHire.dropoffDate']}</div>
                        )}
                      </div>
                      
                      <div className="servicenow-form-group">
                        <label className="servicenow-label block mb-1">Car Type</label>
                        <select 
                          className="servicenow-select w-full"
                          value={formData.carHire.carType}
                          onChange={(e) => updateFormData('carHire.carType', e.target.value)}
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="suv">SUV</option>
                          <option value="van">Van</option>
                        </select>
                      </div>
                      
                      <div className="servicenow-form-group flex items-center">
                        <label className="servicenow-label flex items-center">
                          <input 
                            type="checkbox" 
                            className="servicenow-checkbox mr-2" 
                            checked={formData.carHire.shared}
                            onChange={(e) => updateFormData('carHire.shared', e.target.checked)}
                          />
                          <span>Shared car?</span>
                        </label>
                      </div>
                      
                      {formData.carHire.shared && (
                        <div className="servicenow-form-group md:col-span-2">
                          <label className="servicenow-label block mb-1">Shared with</label>
                          <input 
                            type="text" 
                            className="servicenow-input w-full"
                            value={formData.carHire.sharedWith}
                            onChange={(e) => updateFormData('carHire.sharedWith', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Accommodation */}
              <div className="servicenow-form-group">
                <label className="servicenow-label font-semibold flex items-center">
                  <input 
                    type="checkbox" 
                    className="servicenow-checkbox mr-2" 
                    checked={formData.requireAccommodation}
                    onChange={(e) => {
                      updateFormData('requireAccommodation', e.target.checked);
                      
                      // Reset accommodation data if unchecked
                      if (!e.target.checked) {
                        updateFormData('accommodation', {
                          type: 'hotel',
                          notes: ''
                        });
                        
                        // Also disable LAFHA if accommodation is not required
                        updateFormData('requireLAFHA', false);
                        updateFormData('lafha', []);
                      }
                    }}
                  />
                  <span>Accommodation Required</span>
                </label>
                
                {formData.requireAccommodation && (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="servicenow-form-group">
                        <label className="servicenow-label block mb-1">Accommodation Type</label>
                        <select 
                          className="servicenow-select w-full"
                          value={formData.accommodation.type}
                          onChange={(e) => updateFormData('accommodation.type', e.target.value as 'hotel' | 'private' | 'other')}
                        >
                          <option value="hotel">Hotel</option>
                          <option value="private">Private</option>
                          <option value="other">Other</option>
                        </select>
                        {formErrors['accommodation.type'] && (
                          <div className="servicenow-error mt-1">{formErrors['accommodation.type']}</div>
                        )}
                      </div>
                      
                      <div className="servicenow-form-group md:col-span-2">
                        <label className="servicenow-label block mb-1">Notes</label>
                        <textarea 
                          className="servicenow-textarea w-full"
                          value={formData.accommodation.notes}
                          onChange={(e) => updateFormData('accommodation.notes', e.target.value)}
                          placeholder="Any additional notes"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default TravelDetailsStep;
