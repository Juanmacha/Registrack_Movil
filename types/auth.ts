export interface PermisosModulo {
  crear?: boolean;
  leer?: boolean;
  actualizar?: boolean;
  eliminar?: boolean;
}

export interface Permisos {
  dashboard?: PermisosModulo;
  usuarios?: PermisosModulo;
  empleados?: PermisosModulo;
  roles?: PermisosModulo;
  permisos?: PermisosModulo;
  privilegios?: PermisosModulo;
  solicitudes?: PermisosModulo;
  citas?: PermisosModulo;
  seguimiento?: PermisosModulo;
  clientes?: PermisosModulo;
  pagos?: PermisosModulo;
  servicios?: PermisosModulo;
  empresas?: PermisosModulo;
  archivos?: PermisosModulo;
  gestion_dashboard?: PermisosModulo;
  [key: string]: PermisosModulo | undefined;
}

export interface Rol {
  id?: number | string;
  nombre?: string;
  codigo?: string;
  estado?: boolean;
  permisos?: Permisos;
}

export interface Usuario {
  id?: number | string;
  id_usuario?: number | string;
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  documento?: string;
  tipo_documento?: string;
  rol?: Rol | string; // OBJETO único (no array) o string
  id_rol?: number | string; // Campo alternativo para ID de rol
  idRol?: number | string; // Campo alternativo para ID de rol
  permisos?: string[]; // Permisos legacy (si vienen como array)
  [key: string]: unknown;
}

export interface AuthResponse {
  token: string;
  usuario?: Usuario;
  user?: Usuario;
  refreshToken?: string;
  expiresIn?: number;
  [key: string]: unknown;
}

export interface ForgotPasswordResponse {
  mensaje: string;
}

export interface VerifyCodeResponse {
  token: string;
  mensaje?: string;
}

export interface ResetPasswordResponse {
  mensaje: string;
}

