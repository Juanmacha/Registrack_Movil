import axios from 'axios';

import { API_CONFIG } from '@/constants/api';
import { manejarErrorAPI } from '@/utils/apiError';
import { sanitizeEmail } from '@/utils/sanitizers';
import { validatePasswordStrength } from '@/utils/validators';
import { AuthResponse, ForgotPasswordResponse, ResetPasswordResponse, VerifyCodeResponse } from '@/types/auth';

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.defaultHeaders,
});

const authHeaders: Record<string, string> = {};

export const setAuthToken = (token: string | null) => {
  if (token) {
    authHeaders.Authorization = `Bearer ${token}`;
    apiClient.defaults.headers.common.Authorization = authHeaders.Authorization;
  } else {
    delete authHeaders.Authorization;
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export interface LoginDto {
  correo: string;
  contrasena: string;
}

export interface RegisterDto {
  tipo_documento: string;
  documento: string;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  id_rol: number;
}

export interface ForgotPasswordDto {
  correo: string;
}

export interface VerifyCodeDto {
  correo: string;
  codigo: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export const authApiService = {
  async login(payload: LoginDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_CONFIG.endpoints.login, payload);
      return response.data;
    } catch (error) {
      return manejarErrorAPI(error);
    }
  },
  async register(payload: RegisterDto): Promise<AuthResponse> {
    try {
      if (!validatePasswordStrength(payload.contrasena).isValid) {
        throw new Error('La contraseña no cumple con los requisitos.');
      }
      const response = await apiClient.post<AuthResponse>(API_CONFIG.endpoints.register, payload);
      return response.data;
    } catch (error) {
      return manejarErrorAPI(error);
    }
  },
  async forgotPassword(payload: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    try {
      const data = { correo: sanitizeEmail(payload.correo) };
      const response = await apiClient.post<ForgotPasswordResponse>(API_CONFIG.endpoints.forgotPassword, data);
      return response.data;
    } catch (error) {
      return manejarErrorAPI(error);
    }
  },
  async verifyResetCode(payload: VerifyCodeDto): Promise<VerifyCodeResponse> {
    try {
      const response = await apiClient.post<VerifyCodeResponse>(API_CONFIG.endpoints.verifyResetCode, payload);
      return response.data;
    } catch (error) {
      return manejarErrorAPI(error);
    }
  },
  async resetPassword(payload: ResetPasswordDto): Promise<ResetPasswordResponse> {
    try {
      const response = await apiClient.post<ResetPasswordResponse>(API_CONFIG.endpoints.resetPassword, payload);
      return response.data;
    } catch (error) {
      return manejarErrorAPI(error);
    }
  },
  async isTokenValid(token: string | null) {
    if (!token) {
      return false;
    }
    try {
      const [, payload] = token.split('.');
      if (!payload) {
        return false;
      }
      const decodeBase64 = (value: string) => {
        if (typeof globalThis.atob === 'function') {
          return globalThis.atob(value);
        }
        const buffer = (globalThis as { Buffer?: { from: (data: string, encoding: string) => { toString: (encoding: string) => string } } }).Buffer;
        if (buffer) {
          return buffer.from(value, 'base64').toString('utf-8');
        }
        return '';
      };
      const decoded = JSON.parse(decodeBase64(payload) || '{}');
      if (!decoded.exp) {
        return true;
      }
      const expiresAt = decoded.exp * 1000;
      return Date.now() < expiresAt;
    } catch {
      return false;
    }
  },
};

