"use server";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { createToken } from "@/lib/tokens";
import { forgotPasswordSchema } from "@/lib/schemas/auth";
import { passwordResetEmail } from "@/emails/passwordResetEmail";

const ONE_HOUR = 60 * 60 * 1000;

// Responde igual exista ou não a conta, pra não entregar quais e-mails estão cadastrados.
export async function postForgotPassword(input: { email: string }) {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return;

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) return;

  const { token, tokenHash } = createToken();
  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + ONE_HOUR),
    },
  });
  const url = `${process.env.APP_URL}/redefinir-senha?token=${token}`;
  await sendEmail({ to: user.email, ...passwordResetEmail(user.name, url) });
}
