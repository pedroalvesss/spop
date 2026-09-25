export type PasswordScore = 0 | 1 | 2 | 3 | 4;

export const PASSWORD_LABELS = [
  "Força da senha",
  "Fraca. Tipo seu saldo.",
  "Ok, dá pro gasto.",
  "Boa.",
  "Forte. Mais forte que sua força de vontade no iFood.",
] as const;

export function getPasswordScore(password: string): PasswordScore {
  if (password.length === 0) return 0;
  if (password.length < 6) return 1;
  if (password.length < 9) return 2;
  return /\d/.test(password) && /[A-Za-z]/.test(password) ? 4 : 3;
}
