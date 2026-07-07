import axios from 'axios';
import { Booking, Car, Inquiry, Profile, Session, Testimonial } from '../types';

type CustomerPayload = {
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  documentNumber?: string;
  documentType?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL must be defined in the client environment for production deployment.');
}
const TOKEN_KEY = 'classic_car_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export const authApi = {
  async me() {
    const { data } = await api.get<{ session: Session; profile: Profile }>('/auth/me');
    return data;
  },
  async login(payload: { email: string; password: string }) {
    const { data } = await api.post<{ session: Session; profile: Profile }>('/auth/login', payload);
    saveToken(data.session.token);
    return data;
  },
  async forgotPassword(payload: { email: string }) {
    const { data } = await api.post('/auth/forgot-password', payload);
    return data;
  },
  async resetPassword(token: string, payload: { password: string; confirmPassword: string }) {
    const { data } = await api.post(`/auth/reset-password/${token}`, payload);
    return data;
  },
  logout() {
    clearToken();
  },
};

export const vehicleApi = {
  async list() {
    const { data } = await api.get<Car[]>('/vehicles');
    return data;
  },
  async get(id: string) {
    const { data } = await api.get<Car>(`/vehicles/${id}`);
    return data;
  },
  async update(id: string | number, payload: Partial<Car>) {
    const { data } = await api.patch<Car>(`/vehicles/${id}`, payload);
    return data;
  },
  async updateStatus(id: string | number, status: string) {
    const { data } = await api.patch<Car>(`/vehicles/${id}`, { status });
    return data;
  },
  async remove(id: string | number) {
    await api.delete(`/vehicles/${id}`);
  },
};

export const bookingApi = {
  async list(params?: Record<string, string>) {
    const { data } = await api.get<Booking[]>('/bookings', { params });
    return data;
  },
  async create(payload: Partial<Booking>) {
    const { data } = await api.post<Booking>('/bookings', payload);
    return data;
  },
  async createGuest(payload: Partial<Booking> & { customer?: CustomerPayload }) {
    const { data } = await api.post<Booking>('/bookings/guest', payload);
    return data;
  },
  async update(id: string, payload: Partial<Booking>) {
    const { data } = await api.patch<Booking>(`/bookings/${id}`, payload);
    return data;
  },
  async get(id: string) {
    const { data } = await api.get<Booking>(`/bookings/${id}`);
    return data;
  },
};

export const documentApi = {
  async upload(formData: FormData) {
    const { data } = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export const bookingActions = {
  async action(id: string, payload: { action: string; vehicleId?: string; note?: string }) {
    const { data } = await api.post(`/bookings/${id}/action`, payload);
    return data;
  },
  async addNote(id: string, text: string) {
    const { data } = await api.post(`/bookings/${id}/notes`, { text });
    return data;
  },
  async assign(id: string, vehicleId: string, note?: string) {
    const { data } = await api.post(`/bookings/${id}/assign`, { vehicleId, note });
    return data;
  },
  async changeStatus(id: string, status: string, note?: string) {
    const { data } = await api.post(`/bookings/${id}/status`, { status, note });
    return data;
  },
  async exportCSV(params?: Record<string, string>) {
    const resp = await api.get('/bookings/export/csv', { params, responseType: 'blob' });
    return resp.data;
  },
  async audit(id: string) {
    const { data } = await api.get(`/bookings/${id}/audit`);
    return data;
  },
  async approve(id: string) {
    const { data } = await api.patch<Booking>(`/bookings/${id}/approve`);
    return data;
  },
  async reject(id: string) {
    const { data } = await api.patch<Booking>(`/bookings/${id}/reject`);
    return data;
  },
  async complete(id: string) {
    const { data } = await api.patch<Booking>(`/bookings/${id}/complete`);
    return data;
  },
};

export const inquiryApi = {
  async list() {
    const { data } = await api.get<Inquiry[]>('/inquiries');
    return data;
  },
  async create(payload: Partial<Inquiry>) {
    const { data } = await api.post<Inquiry>('/inquiries', payload);
    return data;
  },
  async update(id: string, payload: Partial<Inquiry>) {
    const { data } = await api.patch<Inquiry>(`/inquiries/${id}`, payload);
    return data;
  },
};

export const testimonialApi = {
  async featured() {
    const { data } = await api.get<Testimonial[]>('/reviews', { params: { featured: true, limit: 6 } });
    return data;
  },
};
