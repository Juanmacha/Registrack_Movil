/* eslint-disable @typescript-eslint/naming-convention */
export const API_TIMEOUT = 150_000;

const DEV_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '/api';
const PROD_BASE_URL = 'https://api-registrack-2.onrender.com/api';

export const API_CONFIG = {
  baseURL: __DEV__ ? DEV_BASE_URL : PROD_BASE_URL,
  timeout: API_TIMEOUT,
  endpoints: {
    login: '/usuarios/login',
    register: '/usuarios/registrar',
    forgotPassword: '/usuarios/forgot-password',
    verifyResetCode: '/usuarios/forgot-password/verify',
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

