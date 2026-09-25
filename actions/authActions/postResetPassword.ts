"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/tokens";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/schemas/auth";

type ResetResult = { ok: true } | { ok: false; error: string };

export async function postResetPassword(
  input: ResetPasswordInput,
): Promise<ResetResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  });
  if (!record || record.expiresAt < new Date()) {
    return {
      ok: false,
      error: "Esse link expirou. Pede outro na tela de entrar.",
    };
  }

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) },
    }),
    db.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);
  return { ok: true };
}
