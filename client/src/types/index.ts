export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'renter';
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Room {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'per_night' | 'per_week' | 'per_month';
  roomType: 'single' | 'double' | 'shared' | 'studio' | 'apartment';
  location: Location;
  amenities: string[];
  images: Array<{
    url: string;
    caption: string;
  }>;
  availability: {
    available: boolean;
    availableFrom: string;
    minimumStay: number;
  };
  owner: User;
  contactInfo: {
    showPhone: boolean;
    showEmail: boolean;
  };
  isActive: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  _id: string;
  room: Room;
  inquirer: User;
  owner: User;
  message: string;
  moveInDate?: string;
  stayDuration?: 'short_term' | 'long_term' | 'flexible';
  status: 'pending' | 'responded' | 'accepted' | 'declined';
  ownerResponse?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface RoomFilters {
  search?: string;
  city?: string;
  state?: string;
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}