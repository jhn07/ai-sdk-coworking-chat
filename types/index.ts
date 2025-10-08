// User types
export interface User {
  id?: string;
  name: string;
  email: string;
  created_at?: string;
}

// Coworking types
export interface Coworking {
  name: string;
  address: string;
  district?: string;
  wifi: string;
  price: string;
  dayPass?: number;
  monthly?: number;
  amenities: string[];
  rating: number;
  image: string;
  lat?: number;
  lng?: number;
}

// Coworking with booking info types
export interface CoworkingWithBookingInfo extends Coworking {
  time: string;
  duration: string;
}

// Booking types
export interface BookingData {
  coworking: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  timezone: string;
  address?: string;
  lat?: number;
  lng?: number;
}

// Saved booking types
export interface SavedBooking {
  id: string;
  user_email: string;
  coworking_name: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  address?: string;
  lat?: number;
  lng?: number;
  timezone?: string;
  created_at?: string;
}

// Search types
export interface SearchArgs {
  city?: string;
  district?: string;
  query?: string;
  max?: number;
}

// Tool output types
export interface SearchCoworkingsOutput {
  success: boolean;
  coworkings: Coworking[];
  fallback: Coworking[];
  total: number;
  appliedFilters?: {
    maxPrice?: number;
    teamSize?: string;
    amenities?: string[];
  };
  error?: string;
}

// Booking output types
export interface BookingOutput {
  success: boolean;
  booking: BookingData;
  message: string;
  confirmationId: string;
}

// Booking error output types
export interface BookingErrorOutput {
  success: false;
  error: string;
  message: string;
}
