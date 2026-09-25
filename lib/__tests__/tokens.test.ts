import { describe, expect, it } from "vitest";
import { createToken, hashToken } from "../tokens";
import { escapeHtml, passwordResetEmail } from "@/emails/passwordResetEmail";

describe("tokens de redefinição", () => {
  it("gera token aleatório e guarda só o hash", () => {
    const a = createToken();
    const b = createToken();
    expect(a.token).not.toBe(b.token);
    expect(a.tokenHash).toBe(hashToken(a.token));
    expect(a.tokenHash).not.toContain(a.token);
  });
});

describe("e-mail de redefinição", () => {
  it("escapa o nome no HTML", () => {
    expect(escapeHtml(`<b>"Pedro"</b>`)).not.toContain("<");
    const { html, text } = passwordResetEmail(
      "<Pedro>",
      "https://spop.app/redefinir-senha?token=x",
    );
    expect(html).not.toContain("<Pedro>");
    expect(text).toContain("https://spop.app/redefinir-senha?token=x");
  });
});
