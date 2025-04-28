
export interface Traveller {
  id: string;
  fullName: string;
  employeeId: string;
  region: string;
  costCentre: string;
  mobile: string;
  role?: string;
  workOrder?: string; // Added for ServiceNow compatibility
}

export interface FlightLeg {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  airlinePreference: string;
  seatPreference?: string; // Added for ServiceNow compatibility
  frequentFlyer?: string; // Added for ServiceNow compatibility
  mealPreference?: string; // Added for ServiceNow compatibility
  notes?: string; // Added for ServiceNow compatibility
}

export interface Ferry {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  notes: string;
  carOnFerry?: boolean; // Added for ServiceNow compatibility
  vehicleDetails?: string; // Added for ServiceNow compatibility
}

export interface CarHire {
  pickupLocation: string;
  pickupDate: string;
  dropoffLocation: string;
  dropoffDate: string;
  carType: string;
  shared: boolean;
  sharedWith: string;
  fuelCardRequired?: boolean; // Added for ServiceNow compatibility
  notes?: string; // Added for ServiceNow compatibility
}

export interface OwnVehicle { // Added for ServiceNow compatibility
  estimatedKilometers: number;
  reimbursementRequested: boolean;
  vehicleDetails: string;
}

export interface AccommodationDetails {
  type: 'hotel' | 'private' | 'other';
  notes: string;
  location?: string; // Added for ServiceNow compatibility
  address?: string; // Added for ServiceNow compatibility
  dateRange?: { start: string; end: string }; // Added for ServiceNow compatibility
  isRemoteArea?: boolean; // Added for ServiceNow compatibility
  isAboriginalLands?: boolean; // Added for ServiceNow compatibility
  isSubstandard?: boolean; // Added for ServiceNow compatibility
  isShortNotice?: boolean; // Added for ServiceNow compatibility
}

export interface LAFHADetails {
  id: string;
  category: string;
  rate: number;
  days: number;
  payInAdvance?: boolean; // Added for ServiceNow compatibility
  mealsProvided?: { // Added for ServiceNow compatibility
    date: string;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  }[];
}

export interface WorksiteLocation { // Added for ServiceNow compatibility
  location: string;
  dateRange: { start: string; end: string };
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
  declarations: {
    correctAndApproved: boolean;
    payrollDeduction: boolean;
    audit: boolean;
    ctmBookings: boolean;
    noPersonalCards: boolean;
  };
  // New fields for ServiceNow compatibility
  travelFor: 'myself' | 'someone' | 'group'; // Added for ServiceNow compatibility
  applyWorkOrderToAll?: boolean; // Added for ServiceNow compatibility
  travelAsPartOfGroup?: boolean; // Added for ServiceNow compatibility
  worksiteDetails?: { // Added for ServiceNow compatibility
    primaryWorksite: string;
    additionalLocations: WorksiteLocation[];
  };
  personalTravel?: { // Added for ServiceNow compatibility
    included: boolean;
    dates?: string[];
  };
  travelClassification?: 'short' | 'long' | 'fbt'; // Added for ServiceNow compatibility
  requireOwnVehicle?: boolean; // Added for ServiceNow compatibility
  ownVehicle?: OwnVehicle; // Added for ServiceNow compatibility
  additionalNotes?: string; // Added for ServiceNow compatibility
}
