
export interface Traveller {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TravelFormData {
  travellers: Traveller[];
  departureDate: Date | null;
  returnDate: Date | null;
  destination: string;
  budget: number;
  transportMode: 'plane' | 'train' | 'bus' | 'car';
}
