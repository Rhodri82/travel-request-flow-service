
// Type definitions for the travel form

export type FormStep = 'traveller-info' | 'travel-details' | 'lafha' | 'approvals';

export type Section = 'traveller-details' | 'purpose-dates' | 'travel-requirements' | 'lafha' | 'emergency-contact' | 'declarations' | 'cost-preview';

export interface Traveller {
  id: string;
  fullName: string;
  employeeId: string;
  region: string;
  costCentre: string;
  mobile: string;
  role?: string;
}

export interface FlightLeg {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  airlinePreference: string;
}

export interface Ferry {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  notes: string;
}

export interface CarHire {
  pickupLocation: string;
  pickupDate: string;
  dropoffLocation: string;
  dropoffDate: string;
  carType: string;
  shared: boolean;
  sharedWith: string;
}

export interface AccommodationDetails {
  type: 'hotel' | 'private' | 'other';
  notes: string;
}

export interface LAFHADetails {
  id: string;
  category: string;
  rate: number;
  days: number;
  sapCode?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface TravelFormData {
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
  isPersonalTravel: boolean;
  declarations: {
    correctAndApproved: boolean;
    payrollDeduction: boolean;
    audit: boolean;
    ctmBookings: boolean;
    noPersonalCards: boolean;
  }
}
