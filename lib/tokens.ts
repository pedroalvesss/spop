import { createHash, randomBytes } from "node:crypto";

export function createToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

// Só o hash vai pro banco: um vazamento da tabela não entrega links válidos.
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
