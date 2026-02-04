export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const PASSWORD_MIN_LENGTH = 6

export interface PasswordChecks {
  minLength: boolean
  hasLower: boolean
  hasUpper: boolean
  hasNumber: boolean
  hasSymbol: boolean
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password)
  }
}

// Regras mínimas de segurança no backend.
export function isStrongPassword(password: string): boolean {
  const checks = getPasswordChecks(password)
  return checks.minLength && checks.hasLower && checks.hasUpper && checks.hasNumber
}

export function getMissingFields(  //funcao que verifica se tem campos obrigatorios faltando
  body: Record<string, unknown>, 
  requiredFields: string[]
): string[] {
  const missing: string[] = [];

  for (const field of requiredFields) {
    const value = body[field];

    // 1. Verifica se é nulo ou undefined
    if (value === null || value === undefined) {
      missing.push(field);
      continue; // Vai para o próximo campo
    }

    // 2. Se for uma string, verifica se está vazia
    if (typeof value === 'string' && value.trim() === '') {
      missing.push(field);
    }
  }

  return missing;
}

export function isIsoWithTimezone(value: string): boolean {
  const isoTzRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[+-]\d{2}:\d{2})$/;
  return isoTzRegex.test(value);
}
