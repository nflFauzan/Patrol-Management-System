import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('patrol_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('patrol_auth_token');
    }
    return Promise.reject(error);
  },
);

export const attendanceApi = {
  getTodayStatus: async () => {
    const res = await apiClient.get('/attendance/today');
    return res.data;
  },

  clockIn: async (payload: { siteId: string; latitude: number; longitude: number; photoBase64?: string; notes?: string }) => {
    const res = await apiClient.post('/attendance/clock-in', payload);
    return res.data;
  },

  clockOut: async (payload: { attendanceId: string; latitude: number; longitude: number; photoBase64?: string; notes?: string }) => {
    const res = await apiClient.post('/attendance/clock-out', payload);
    return res.data;
  },

  leaveRequest: async (payload: { siteId: string; status: string; date: string; leaveReason: string; attachmentBase64?: string }) => {
    const res = await apiClient.post('/attendance/leave', payload);
    return res.data;
  },
};

export const sitesApi = {
  getAll: async () => {
    const res = await apiClient.get('/sites');
    return res.data;
  },
};
