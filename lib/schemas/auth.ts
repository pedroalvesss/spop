import { z } from "zod";

const email = z
  .email("Esse e-mail não parece um e-mail.")
  .transform((v) => v.toLowerCase());
const newPassword = z.string().min(6, "Senha com pelo menos 6 caracteres.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Senha errada. Pelo menos o dinheiro tá seguro."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Faltou o nome."),
    email,
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não batem.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não batem.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
