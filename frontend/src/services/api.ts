import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (data: {
    ad: string;
    soyad: string;
    email: string;
    telefon: string;
    password: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const odaService = {
  getAll: async () => {
    const response = await api.get('/odalar');
    return response.data;
  },
  getAvailable: async (params: {
    girisTarihi?: string;
    cikisTarihi?: string;
    kisiSayisi?: number;
  }) => {
    const response = await api.get('/odalar/musait', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/odalar/${id}`);
    return response.data;
  },
  create: async (data: {
    ad: string;
    aciklama: string;
    fiyat: number;
    kapasite: number;
    durum: 'AKTIF' | 'PASIF';
    resim: string;
    otelId: number;
  }) => {
    const response = await api.post('/odalar', data);
    return response.data;
  },
  update: async (
    id: number,
    data: {
      ad?: string;
      aciklama?: string;
      fiyat?: number;
      kapasite?: number;
      durum?: 'AKTIF' | 'PASIF';
      resim?: string;
      otelId?: number;
    }
  ) => {
    const response = await api.put(`/odalar/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/odalar/${id}`);
    return response.data;
  },
};

export const rezervasyonService = {
  getAll: async () => {
    const response = await api.get('/rezervasyonlar');
    return response.data;
  },
  getUserRezervasyonlar: async () => {
    const response = await api.get('/rezervasyonlar/kullanici');
    return response.data;
  },
  create: async (data: {
    odaId: number;
    girisTarihi: string;
    cikisTarihi: string;
    kisiSayisi: number;
    notlar?: string;
  }) => {
    const response = await api.post('/rezervasyonlar', data);
    return response.data;
  },
  updateStatus: async (id: number, durum: 'ONAYLANDI' | 'IPTAL_EDILDI') => {
    const response = await api.put(`/rezervasyonlar/${id}/durum`, { durum });
    return response.data;
  },
  iptalEt: async (id: number) => {
    const response = await api.put(`/rezervasyonlar/${id}/iptal`);
    return response.data;
  },
};

export const otelService = {
  getAll: async () => {
    const response = await api.get('/oteller');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/oteller/${id}`);
    return response.data;
  },
  create: async (data: {
    ad: string;
    aciklama: string;
    adres: string;
    sehir: string;
    resim: string;
  }) => {
    const response = await api.post('/oteller', data);
    return response.data;
  },
  update: async (
    id: number,
    data: {
      ad?: string;
      aciklama?: string;
      adres?: string;
      sehir?: string;
      resim?: string;
    }
  ) => {
    const response = await api.put(`/oteller/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/oteller/${id}`);
    return response.data;
  },
};

export const hotelService = {
  getAll: () => api.get('/admin/hotels').then(res => res.data),
  create: (data: any) => api.post('/admin/hotels', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/admin/hotels/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/admin/hotels/${id}`).then(res => res.data),
  assignManager: (hotelId: string, managerId: string) => 
    api.post(`/admin/hotels/${hotelId}/manager`, { managerId }).then(res => res.data),
};

export const userService = {
  getAll: () => api.get('/admin/users').then(res => res.data),
  create: (data: any) => api.post('/admin/users', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/admin/users/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/admin/users/${id}`).then(res => res.data),
};

export const roomService = {
  getAll: () => api.get('/admin/rooms').then(res => res.data),
  create: (data: any) => api.post('/admin/rooms', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/admin/rooms/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/admin/rooms/${id}`).then(res => res.data),
};

export const reservationService = {
  getAll: () => api.get('/admin/reservations').then(res => res.data),
  update: (id: string, data: any) => api.put(`/admin/reservations/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/admin/reservations/${id}`).then(res => res.data),
  cancel: (id: string) => api.post(`/admin/reservations/${id}/cancel`).then(res => res.data),
};

export default api; 