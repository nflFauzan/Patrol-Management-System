import axios from 'axios';
import { RegisterRequestDto, ApproveUserDto, RejectUserDto, RoleDefinition, PermissionDefinition, User } from '@patrol/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('patrol_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('patrol_auth_token');
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: async (payload: { username: string; password: string; hp_input?: string }) => {
    const res = await apiClient.post('/auth/login', payload);
    if (res.data?.token) {
      localStorage.setItem('patrol_auth_token', res.data.token);
    }
    return res.data;
  },
  register: async (payload: RegisterRequestDto) => {
    const res = await apiClient.post('/auth/register', payload);
    return res.data;
  },
  getProfile: async (): Promise<User> => {
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

export const approvalApi = {
  getQueue: async () => {
    const res = await apiClient.get('/users/approval-queue');
    return res.data;
  },
  approve: async (id: string, payload: ApproveUserDto) => {
    const res = await apiClient.post(`/users/${id}/approve`, payload);
    return res.data;
  },
  reject: async (id: string, payload: RejectUserDto) => {
    const res = await apiClient.post(`/users/${id}/reject`, payload);
    return res.data;
  },
};

export const rbacApi = {
  getRoles: async (): Promise<RoleDefinition[]> => {
    const res = await apiClient.get('/users/rbac/roles');
    return res.data;
  },
  createRole: async (payload: { code: string; name: string; description?: string; permissions?: string[]; permissionIds?: string[] }): Promise<RoleDefinition> => {
    const permissions = payload.permissions || payload.permissionIds || [];
    const res = await apiClient.post('/users/rbac/roles', { ...payload, permissions });
    return res.data;
  },
  updateRole: async (
    id: string,
    payload: { name?: string; description?: string; permissions?: string[]; isActive?: boolean },
  ): Promise<RoleDefinition> => {
    const res = await apiClient.put(`/users/rbac/roles/${id}`, payload);
    return res.data;
  },
  deactivateRole: async (id: string): Promise<{ id: string; code: string; isActive: boolean }> => {
    const res = await apiClient.delete(`/users/rbac/roles/${id}`);
    return res.data;
  },
  getPermissions: async (): Promise<PermissionDefinition[]> => {
    const res = await apiClient.get('/users/rbac/permissions');
    return res.data;
  },
  assignUserRole: async (userId: string, roleId: string): Promise<User> => {
    const res = await apiClient.put(`/users/${userId}/role`, { roleId });
    return res.data;
  },
};

export const sitesApi = {
  getAll: async () => {
    const res = await apiClient.get('/sites');
    return res.data;
  },
};

export const usersApi = {
  getAll: async (params?: { siteId?: string; division?: string; search?: string }) => {
    const res = await apiClient.get('/users', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post('/users', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/users/${id}`, data);
    return res.data;
  },
};

export const attendanceApi = {
  getTodayStatus: async () => {
    const res = await apiClient.get('/attendance/today');
    return res.data;
  },
  getHistory: async (limit = 30) => {
    const res = await apiClient.get('/attendance/history', { params: { limit } });
    return res.data;
  },
};

export const checkpointsApi = {
  getBySite: async (siteId: string, category?: string) => {
    const res = await apiClient.get(`/checkpoints/site/${siteId}`, { params: { category } });
    return res.data;
  },
};

export const reportsApi = {
  getHrisAttendanceRecap: async (params?: { startDate?: string; endDate?: string; siteId?: string; division?: string }) => {
    const res = await apiClient.get('/reports/hris-attendance', { params });
    return res.data;
  },
};
