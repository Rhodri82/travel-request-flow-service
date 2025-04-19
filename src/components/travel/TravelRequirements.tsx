
import React from 'react';
import { Input } from "@/components/ui/input";
import { FlightLeg, Ferry, CarHire } from '@/types/travel';
import { Plane, Ship, Car } from 'lucide-react';

interface TravelRequirementsProps {
  formData: {
    requireFlights: boolean;
    flightLegs: FlightLeg[];
    requireFerry: boolean;
    ferries: Ferry[];
    requireCarHire: boolean;
    carHire: CarHire;
  };
  formErrors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  addFlightLeg: () => void;
  removeFlightLeg: (id: string) => void;
  updateFlightLegField: (id: string, field: keyof FlightLeg, value: string) => void;
  addFerry: () => void;
  removeFerry: (id: string) => void;
  updateFerryField: (id: string, field: keyof Ferry, value: string) => void;
}

const TravelRequirements: React.FC<TravelRequirementsProps> = ({
  formData,
  formErrors,
  handleInputChange,
  addFlightLeg,
  removeFlightLeg,
  updateFlightLegField,
  addFerry,
  removeFerry,
  updateFerryField,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Travel Requirements</h2>

      {/* Flights Section */}
      <div className="mb-8">
        <label className="inline-flex items-center text-gray-700 mb-4">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
            name="requireFlights"
            checked={formData.requireFlights}
            onChange={handleInputChange}
          />
          <Plane className="mr-2 h-4 w-4" />
          Flights Required
        </label>

        {formData.requireFlights && (
          <div className="space-y-6">
            {/* Outward Flight */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Outward Flight</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Location <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Airport code or city"
                    value={formData.flightLegs[0]?.from || ''}
                    onChange={(e) => updateFlightLegField(formData.flightLegs[0]?.id || '', 'from', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Airport code or city"
                    value={formData.flightLegs[0]?.to || ''}
                    onChange={(e) => updateFlightLegField(formData.flightLegs[0]?.id || '', 'to', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Outward Flight Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.flightLegs[0]?.date || ''}
                    onChange={(e) => updateFlightLegField(formData.flightLegs[0]?.id || '', 'date', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <select
                    value={formData.flightLegs[0]?.time || ''}
                    onChange={(e) => updateFlightLegField(formData.flightLegs[0]?.id || '', 'time', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">No preference</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Return Flight */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Return Flight</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Location <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Airport code or city"
                    value={formData.flightLegs[1]?.from || ''}
                    onChange={(e) => updateFlightLegField(formData.flightLegs[1]?.id || '', 'from', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Airport code or city"
                    value={formData.flightLegs[1]?.to || ''}
                    onChange={(e) => updateFlightLegField(formData.flightLegs[1]?.id || '', 'to', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Flight Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.flightLegs[1]?.date || ''}
                    onChange={(e) => updateFlightLegField(formData.flightLegs[1]?.id || '', 'date', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <select
                    value={formData.flightLegs[1]?.time || ''}
                    onChange={(e) => updateFlightLegField(formData.flightLegs[1]?.id || '', 'time', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">No preference</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Flight Details */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequent Flyer Number (optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your frequent flyer number"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seating Preference
                  </label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">No preference</option>
                    <option value="window">Window</option>
                    <option value="aisle">Aisle</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Requirements / Notes (optional)
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  rows={3}
                  placeholder="Enter any special meal requirements or additional notes"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ferry Section */}
      <div className="mb-8">
        <label className="inline-flex items-center text-gray-700 mb-4">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
            name="requireFerry"
            checked={formData.requireFerry}
            onChange={handleInputChange}
          />
          <Ship className="mr-2 h-4 w-4" />
          Ferry Travel Required
        </label>

        {formData.requireFerry && (
          <>
            {formErrors.ferries && (
              <div className="text-red-500 text-sm mt-1">{formErrors.ferries}</div>
            )}

            {formData.ferries.map((ferry, index) => (
              <div key={ferry.id} className="mb-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Departure port"
                      value={ferry.from}
                      onChange={(e) => updateFerryField(ferry.id, 'from', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Arrival port"
                      value={ferry.to}
                      onChange={(e) => updateFerryField(ferry.id, 'to', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={ferry.date}
                      onChange={(e) => updateFerryField(ferry.id, 'date', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time
                    </label>
                    <Input
                      type="time"
                      value={ferry.time}
                      onChange={(e) => updateFerryField(ferry.id, 'time', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFerry(ferry.id)}
                  className="mt-4 text-red-600 hover:text-red-800"
                >
                  Remove Ferry
                </button>
              </div>
            ))}

            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              onClick={addFerry}
            >
              + Add Ferry Journey
            </button>
          </>
        )}
      </div>

      {/* Car Hire Section */}
      <div className="mb-4">
        <label className="inline-flex items-center text-gray-700 mb-4">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
            name="requireCarHire"
            checked={formData.requireCarHire}
            onChange={handleInputChange}
          />
          <Car className="mr-2 h-4 w-4" />
          Car Hire Required
        </label>

        {formData.requireCarHire && (
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="carHire.pickupLocation"
                  value={formData.carHire.pickupLocation}
                  onChange={handleInputChange}
                  placeholder="Airport/City"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="carHire.pickupDate"
                  value={formData.carHire.pickupDate}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drop-off Location <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="carHire.dropoffLocation"
                  value={formData.carHire.dropoffLocation}
                  onChange={handleInputChange}
                  placeholder="Airport/City"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drop-off Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="carHire.dropoffDate"
                  value={formData.carHire.dropoffDate}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Type
                </label>
                <select
                  name="carHire.carType"
                  value={formData.carHire.carType}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelRequirements;
