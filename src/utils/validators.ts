export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

//Valida se a senha tem min 8 chars, letras e números.

export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasLetter && hasNumber;
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
