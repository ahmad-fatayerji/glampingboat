export type PasswordPolicyResult = {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  valid: boolean;
};

export const PASSWORD_POLICY_ERROR =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";

export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const result = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };

  return {
    ...result,
    valid: Object.values(result).every(Boolean),
  };
}

