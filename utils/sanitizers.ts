export interface LoginPayload {
  correo: string;
  contrasena: string;
}

export interface RegisterPayload {
  tipo_documento: string;
  documento: string;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  id_rol: number;
}

export const sanitizeEmail = (correo: string) => correo.trim().toLowerCase();

const sanitizeString = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const sanitizeLoginData = (data: LoginPayload): LoginPayload => ({
  correo: sanitizeEmail(data.correo),
  contrasena: data.contrasena.trim(),
});

export const sanitizeRegisterData = (data: RegisterPayload): RegisterPayload => ({
  tipo_documento: data.tipo_documento.trim().toUpperCase(),
  documento: data.documento.replace(/[^\d]/g, ''),
  nombre: sanitizeString(data.nombre),
  apellido: sanitizeString(data.apellido),
  correo: sanitizeEmail(data.correo),
  contrasena: data.contrasena.trim(),
  telefono: data.telefono?.replace(/[^\d+]/g, ''),
  id_rol: data.id_rol,
});

