import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "../schemas/auth";

function firstError(result: {
  success: boolean;
  error?: { issues: { message: string }[] };
}) {
  return result.error?.issues[0]?.message;
}

describe("schemas de auth", () => {
  it("normaliza o e-mail pra minúsculas", () => {
    expect(
      loginSchema.parse({ email: "Pedro@Email.com", password: "x" }).email,
    ).toBe("pedro@email.com");
  });

  it("valida o registro na ordem do protótipo", () => {
    const base = {
      name: "Pedro",
      email: "p@e.com",
      password: "123456",
      confirmPassword: "123456",
    };
    expect(firstError(registerSchema.safeParse({ ...base, name: " " }))).toBe(
      "Faltou o nome.",
    );
    expect(
      firstError(registerSchema.safeParse({ ...base, email: "pedro" })),
    ).toBe("Esse e-mail não parece um e-mail.");
    expect(
      firstError(
        registerSchema.safeParse({
          ...base,
          password: "123",
          confirmPassword: "123",
        }),
      ),
    ).toBe("Senha com pelo menos 6 caracteres.");
    expect(
      firstError(
        registerSchema.safeParse({ ...base, confirmPassword: "654321" }),
      ),
    ).toBe("As senhas não batem.");
    expect(registerSchema.safeParse(base).success).toBe(true);
  });
});
