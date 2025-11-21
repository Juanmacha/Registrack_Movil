export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (correo: string) => EMAIL_REGEX.test(correo.trim());

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

const PASSWORD_RULES = [
  { test: (value: string) => value.length >= 8, message: 'Al menos 8 caracteres.' },
  { test: (value: string) => /[A-Z]/.test(value), message: 'Una letra mayúscula.' },
  { test: (value: string) => /[a-z]/.test(value), message: 'Una letra minúscula.' },
  { test: (value: string) => /\d/.test(value), message: 'Un número.' },
  { test: (value: string) => /[!@#$%^&*(),.?":{}|<>_\-]/.test(value), message: 'Un carácter especial.' },
];

export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  const errors = PASSWORD_RULES.filter(({ test }) => !test(password)).map(({ message }) => message);
  return { isValid: errors.length === 0, errors };
};

export const getPasswordRequirementsShort = () =>
  'Min. 8 caracteres, mayúscula, minúscula, número y carácter especial.';

export const isNumericCode = (value: string, length = 6) => new RegExp(`^\\d{${length}}$`).test(value);

