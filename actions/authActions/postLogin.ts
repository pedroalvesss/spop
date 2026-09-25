"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";

export type AuthResult =
  { ok: true; name: string } | { ok: false; error: string };

const WRONG_PASSWORD = "Senha errada. Pelo menos o dinheiro tá seguro.";

export async function postLogin(input: LoginInput): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, error: WRONG_PASSWORD };
    throw error;
  }

  const user = await db.user.findUniqueOrThrow({
    where: { email: parsed.data.email },
    select: { name: true },
  });
  return { ok: true, name: user.name };
}
