"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { DEFAULT_ACCOUNT, DEFAULT_CATEGORIES } from "@/lib/defaults";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";
import type { AuthResult } from "./postLogin";

export async function postRegister(input: RegisterInput): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  const { name, email, password } = parsed.data;

  const exists = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (exists)
    return { ok: false, error: "Esse e-mail já tem conta. Tenta entrar." };

  await db.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      categories: { create: DEFAULT_CATEGORIES.map((c) => ({ ...c })) },
      accounts: { create: DEFAULT_ACCOUNT },
    },
  });

  await signIn("credentials", { email, password, redirect: false });
  return { ok: true, name };
}
