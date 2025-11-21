import axios, { AxiosInstance } from 'axios';

import { API_CONFIG } from '@/constants/api';
import { manejarErrorAPI } from '@/utils/apiError';
import {
  DashboardIngresosResponse,
  DashboardServiciosResponse,
  DashboardRenovacionesResponse,
  DashboardInactivasResponse,
  PeriodoValue,
} from '@/types/dashboard';

// Crear instancia compartida que se actualizará con el token
let apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.defaultHeaders,
});

// Función para actualizar el token en el cliente del dashboard
export const setDashboardAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const dashboardApiService = {
  async getIngresos(periodo: PeriodoValue = '12meses'): Promise<DashboardIngresosResponse> {
    try {
      const response = await apiClient.get<DashboardIngresosResponse>(
        `${API_CONFIG.endpoints.dashboardIngresos}?periodo=${periodo}`,
      );
      return response.data;
    } catch (error) {
      return manejarErrorAPI(error);
    }
  },

  async getServicios(periodo: PeriodoValue = '12meses'): Promise<DashboardServiciosResponse> {
    try {
      const response = await apiClient.get<DashboardServiciosResponse>(
        `${API_CONFIG.endpoints.dashboardServicios}?periodo=${periodo}`,
      );
      return response.data;
    } catch (error) {
      return manejarErrorAPI(error);
    }
  },

  async getRenovaciones(format: 'json' | 'excel' = 'json'): Promise<DashboardRenovacionesResponse | Blob> {
    try {
      const response = await apiClient.get(`${API_CONFIG.endpoints.dashboardRenovaciones}?format=${format}`, {
        responseType: format === 'excel' ? 'blob' : 'json',
      });
      console.log('🔍 DEBUG API RENOVACIONES - Respuesta raw:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('🔍 DEBUG API RENOVACIONES - Error:', error);
      return manejarErrorAPI(error);
    }
  },

  async getInactivas(format: 'json' | 'excel' = 'json'): Promise<DashboardInactivasResponse | Blob> {
    try {
      const response = await apiClient.get(`${API_CONFIG.endpoints.dashboardInactivas}?format=${format}`, {
        responseType: format === 'excel' ? 'blob' : 'json',
      });
      return response.data;
    } catch (error) {
      return manejarErrorAPI(error);
    }
  },
};

