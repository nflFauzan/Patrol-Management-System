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

export const checkpointsApi = {
  getBySite: async (siteId: string, category?: string) => {
    const res = await apiClient.get(`/checkpoints/site/${siteId}`, {
      params: { category },
    });
    return res.data;
  },
  getByQrToken: async (qrToken: string) => {
    const res = await apiClient.get(`/checkpoints/scan/${qrToken}`);
    return res.data;
  },
};

export const patrolApi = {
  getLogs: async (siteId?: string, limit?: number) => {
    const res = await apiClient.get('/patrol/logs', {
      params: { siteId, limit },
    });
    return res.data;
  },
  recordScan: async (payload: {
    siteId: string;
    checkpointId?: string;
    qrPayload?: string;
    latitude: number;
    longitude: number;
    statusResult?: string;
    notes?: string;
    photoKey?: string;
  }) => {
    const res = await apiClient.post('/patrol/scan', payload);
    return res.data;
  },
  getIncidents: async (siteId?: string) => {
    const res = await apiClient.get('/patrol/incidents', {
      params: { siteId },
    });
    return res.data;
  },
};

export const cleaningApi = {
  submitChecklist: async (payload: {
    siteId: string;
    checkpointId?: string;
    qrPayload?: string;
    floorCleaned: boolean;
    trashEmptied: boolean;
    suppliesRestocked: boolean;
    odorNormal: boolean;
    notes?: string;
    photoKey?: string;
  }) => {
    const res = await apiClient.post('/cleaning/checklist', payload);
    return res.data;
  },
  getChecklists: async (siteId?: string, limit?: number) => {
    const res = await apiClient.get('/cleaning/checklists', {
      params: { siteId, limit },
    });
    return res.data;
  },
};

