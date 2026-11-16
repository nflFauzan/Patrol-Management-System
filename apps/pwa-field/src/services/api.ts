import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1';

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

  getHistory: async (limit = 30) => {
    const res = await apiClient.get('/attendance/history', { params: { limit } });
    return res.data;
  },

  getUserHistory: async (limit = 30) => {
    const res = await apiClient.get('/attendance/history', { params: { limit } });
    return res.data;
  },

  clockIn: async (payload: {
    id?: string;
    siteId: string;
    latitude: number;
    longitude: number;
    photoBase64?: string;
    notes?: string;
    deviceTimestamp?: string;
  }) => {
    const res = await apiClient.post('/attendance/clock-in', payload);
    return res.data;
  },

  clockOut: async (payload: {
    id?: string;
    attendanceId?: string;
    siteId?: string;
    latitude: number;
    longitude: number;
    photoBase64?: string;
    notes?: string;
    deviceTimestamp?: string;
  }) => {
    let attId = payload.attendanceId;
    if (!attId) {
      const today = await apiClient.get('/attendance/today').catch(() => null);
      attId = today?.data?.id || 'today-attendance-id';
    }
    const res = await apiClient.post('/attendance/clock-out', { ...payload, attendanceId: attId });
    return res.data;
  },

  leaveRequest: async (payload: { siteId: string; status: string; date: string; leaveReason: string; attachmentBase64?: string }) => {
    const res = await apiClient.post('/attendance/leave', payload);
    return res.data;
  },

  requestLeave: async (payload: { siteId: string; status: string; date: string; leaveReason: string; attachmentBase64?: string }) => {
    const res = await apiClient.post('/attendance/leave', payload);
    return res.data;
  },
};

export const authApi = {
  login: async (payload: { username: string; password: string; hp_input?: string }) => {
    const res = await apiClient.post('/auth/login', payload);
    if (res.data?.token) {
      localStorage.setItem('patrol_auth_token', res.data.token);
    }
    return res.data;
  },
  getProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  updatePassword: async (userId: string, password: string) => {
    const res = await apiClient.patch(`/auth/users/${userId}/password`, { password });
    return res.data;
  },
  updatePhoto: async (userId: string, photoKey: string) => {
    const res = await apiClient.patch(`/auth/users/${userId}/photo`, { photoKey });
    return res.data;
  },
};

export const broadcastApi = {
  getActive: async (siteId?: string) => {
    const res = await apiClient.get('/broadcast/active', { params: { siteId } });
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
    id?: string;
    siteId: string;
    checkpointId?: string;
    qrPayload?: string;
    latitude: number;
    longitude: number;
    statusResult?: string;
    notes?: string;
    photoKey?: string;
    deviceTimestamp?: string;
  }) => {
    const res = await apiClient.post('/patrol/scan', payload);
    return res.data;
  },
  scanCheckpoint: async (payload: {
    siteId: string;
    qrCodeToken: string;
    latitude: number;
    longitude: number;
    notes?: string;
  }) => {
    const res = await apiClient.post('/patrol/scan', {
      siteId: payload.siteId,
      qrPayload: payload.qrCodeToken,
      latitude: payload.latitude,
      longitude: payload.longitude,
      notes: payload.notes,
    });
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

export const sosApi = {
  trigger: async (payload: {
    siteId: string;
    latitude: number;
    longitude: number;
    message?: string;
  }) => {
    const res = await apiClient.post('/sos/trigger', payload);
    return res.data;
  },
  triggerAlert: async (payload: {
    siteId?: string;
    latitude: number;
    longitude: number;
    notes?: string;
  }) => {
    const res = await apiClient.post('/sos/trigger', {
      siteId: payload.siteId || '11111111-1111-1111-1111-111111111111',
      latitude: payload.latitude,
      longitude: payload.longitude,
      message: payload.notes,
    });
    return res.data;
  },
  getActive: async () => {
    const res = await apiClient.get('/sos/active');
    return res.data;
  },
  acknowledge: async (alertId: string) => {
    const res = await apiClient.post(`/sos/${alertId}/acknowledge`);
    return res.data;
  },
  resolve: async (alertId: string, resolutionNotes: string) => {
    const res = await apiClient.post(`/sos/${alertId}/resolve`, { resolutionNotes });
    return res.data;
  },
};

export const driverApi = {
  startTrip: async (payload: {
    siteId: string;
    vehiclePlateNumber: string;
    vehicleType: string;
    originLocation: string;
    destinationLocation: string;
    odometerStart?: number;
    tripNotes?: string;
    photoBase64?: string;
  }) => {
    const res = await apiClient.post('/driver/trips/start', {
      ...payload,
      odometerStart: payload.odometerStart || 0,
    });
    return res.data;
  },
  completeTrip: async (tripId: string, payload: { odometerEnd: number; tripNotes?: string }) => {
    const res = await apiClient.post(`/driver/trips/${tripId}/complete`, payload);
    return res.data;
  },
  getActiveTrip: async () => {
    const res = await apiClient.get('/driver/trips/active');
    return res.data;
  },
  getTrips: async (siteId?: string, limit?: number) => {
    const res = await apiClient.get('/driver/trips', { params: { siteId, limit } });
    return res.data;
  },
};

export const reportsApi = {
  getHrisAttendanceRecap: async (params?: { startDate?: string; endDate?: string; siteId?: string; division?: string }) => {
    const res = await apiClient.get('/reports/hris-attendance', { params });
    return res.data;
  },
};



