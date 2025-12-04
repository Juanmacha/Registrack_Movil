/* eslint-disable @typescript-eslint/naming-convention */
export const API_TIMEOUT = 150_000;

// 🔄 Cambia esto a true para usar localhost cuando Render esté caído
const USE_LOCAL_API = true;

const DEV_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '/api';
const LOCAL_BASE_URL = 'http://localhost:3000/api';
const PROD_BASE_URL = 'https://apiregistrack-b0b629b0780d.herokuapp.com/api';

// Selecciona la URL según el entorno y la configuración
const getBaseURL = () => {
  if (USE_LOCAL_API) {
    return LOCAL_BASE_URL;
  }
  return __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;
};

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: API_TIMEOUT,
  endpoints: {
    login: '/usuarios/login',
    register: '/usuarios/registrar',
    forgotPassword: '/usuarios/forgot-password',
    verifyResetCode: '/usuarios/forgot-password/verify-code',
    resetPassword: '/usuarios/reset-password',
    dashboardIngresos: '/dashboard/ingresos',
    dashboardServicios: '/dashboard/servicios',
    dashboardResumen: '/dashboard/resumen',
    dashboardRenovaciones: '/dashboard/renovaciones-proximas',
    dashboardInactivas: '/dashboard/inactivas',
  },
  defaultHeaders: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;

export type ApiEndpointKey = keyof typeof API_CONFIG.endpoints;

export const buildEndpoint = (key: ApiEndpointKey) => `${API_CONFIG.endpoints[key]}`;

