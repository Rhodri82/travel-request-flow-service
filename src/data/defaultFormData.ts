
import { TravelFormData } from '../types/travel';

// LAFHA rates data from requirements
export const LAFHA_RATES = {
  'Full Day (OR03)': 148.70,
  'Private (OR23)': 268.34,
  'Employee-arranged (OR24)': 289.70,
  'Remote Area': 41.90,
  'Short Notice / Substandard': 41.90,
  'Incidentals (0A57)': 12.12,
  'Breakfast': 32.72,
  'Lunch': 46.51,
  'Dinner': 69.47
};

// Default form data
export const defaultFormData: TravelFormData = {
  bookingOnBehalf: false,
  travellers: [{
    id: '1',
    fullName: '',
    employeeId: '',
    region: '',
    costCentre: '',
    mobile: '',
  }],
  purpose: '',
  travelType: '',
  fromDate: '',
  toDate: '',
  destination: '',
  nights: 0,
  requireFlights: false,
  flightLegs: [],
  returnFlight: false,
  baggage: 'carry-on',
  requireFerry: false,
  ferries: [],
  requireCarHire: false,
  carHire: {
    pickupLocation: '',
    pickupDate: '',
    dropoffLocation: '',
    dropoffDate: '',
    carType: 'small',
    shared: false,
    sharedWith: ''
  },
  requireAccommodation: false,
  accommodation: {
    type: 'hotel',
    notes: ''
  },
  requireLAFHA: false,
  lafha: [],
  requireEmergencyContact: false,
  emergencyContact: {
    name: '',
    phone: '',
    relationship: ''
  },
  isPersonalTravel: false,
  declarations: {
    correctAndApproved: false,
    payrollDeduction: false,
    audit: false,
    ctmBookings: false,
    noPersonalCards: false
  }
};
