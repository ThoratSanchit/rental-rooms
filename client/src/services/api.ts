import axios from 'axios';
import { AuthResponse, ApiResponse, PaginatedResponse, Room, Inquiry, RoomFilters } from '../types';

// Prefer env override; default to local API for development
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:12001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'owner' | 'renter';
  }) => api.post<AuthResponse>('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', credentials),

  getMe: () => api.get<ApiResponse<any>>('/auth/me'),
};

// Rooms API
export const roomsAPI = {
  getRooms: (filters?: RoomFilters) =>
    api.get<PaginatedResponse<Room>>('/rooms', { params: filters }),

  getRoom: (id: string) => api.get<ApiResponse<Room>>(`/rooms/${id}`),

  createRoom: (roomData: FormData) =>
    api.post<ApiResponse<Room>>('/rooms', roomData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateRoom: (id: string, roomData: Partial<Room>) =>
    api.put<ApiResponse<Room>>(`/rooms/${id}`, roomData),

  deleteRoom: (id: string) => api.delete<ApiResponse<any>>(`/rooms/${id}`),

  getOwnerRooms: () => api.get<ApiResponse<Room[]>>('/rooms/owner/my-rooms'),
};

// Inquiries API
export const inquiriesAPI = {
  createInquiry: (inquiryData: {
    roomId: string;
    message: string;
    moveInDate?: string;
    stayDuration?: string;
  }) => api.post<ApiResponse<Inquiry>>('/inquiries', inquiryData),

  getUserInquiries: (page?: number) =>
    api.get<PaginatedResponse<Inquiry>>('/inquiries/my-inquiries', {
      params: { page },
    }),

  getOwnerInquiries: (status?: string, page?: number) =>
    api.get<PaginatedResponse<Inquiry>>('/inquiries/owner/inquiries', {
      params: { status, page },
    }),

  respondToInquiry: (id: string, response: string, status: string) =>
    api.put<ApiResponse<Inquiry>>(`/inquiries/${id}/respond`, {
      response,
      status,
    }),
};

export default api;