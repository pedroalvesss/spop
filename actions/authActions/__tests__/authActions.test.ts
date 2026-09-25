import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthError } from "next-auth";
import { postLogin } from "../postLogin";
import { postRegister } from "../postRegister";
import { postForgotPassword } from "../postForgotPassword";
import { postResetPassword } from "../postResetPassword";
import { hashToken } from "@/lib/tokens";

const { signIn, db, sendEmail } = vi.hoisted(() => ({
  signIn: vi.fn(),
  sendEmail: vi.fn(),
  db: {
    user: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/auth", () => ({ signIn }));
vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/email", () => ({ sendEmail }));

beforeEach(() => vi.resetAllMocks());

describe("postLogin", () => {
  it("devolve a mensagem de senha errada quando o Auth.js recusa", async () => {
    signIn.mockRejectedValue(new AuthError("CredentialsSignin"));
    const result = await postLogin({ email: "p@e.com", password: "x" });
    expect(result).toEqual({
      ok: false,
      error: "Senha errada. Pelo menos o dinheiro tá seguro.",
    });
  });

  it("devolve o nome pra saudação", async () => {
    db.user.findUniqueOrThrow.mockResolvedValue({ name: "Pedro" });
    expect(await postLogin({ email: "P@E.com", password: "123456" })).toEqual({
      ok: true,
      name: "Pedro",
    });
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "p@e.com",
      password: "123456",
      redirect: false,
    });
  });
});

describe("postRegister", () => {
  const input = {
    name: "Pedro",
    email: "p@e.com",
    password: "123456",
    confirmPassword: "123456",
  };

  it("não deixa repetir e-mail", async () => {
    db.user.findUnique.mockResolvedValue({ id: "1" });
    expect(await postRegister(input)).toEqual({
      ok: false,
      error: "Esse e-mail já tem conta. Tenta entrar.",
    });
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it("cria usuário com senha em hash, categorias e conta padrão", async () => {
    db.user.findUnique.mockResolvedValue(null);
    await postRegister(input);
    const data = db.user.create.mock.calls[0][0].data;
    expect(data.passwordHash).not.toBe("123456");
    expect(data.categories.create).toHaveLength(12);
    expect(data.accounts.create.name).toBe("Dinheiro");
    expect(signIn).toHaveBeenCalled();
  });
});

describe("postForgotPassword", () => {
  it("não faz nada (e não conta) quando o e-mail não existe", async () => {
    db.user.findUnique.mockResolvedValue(null);
    await postForgotPassword({ email: "ninguem@e.com" });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("guarda só o hash do token e manda o link por e-mail", async () => {
    db.user.findUnique.mockResolvedValue({
      id: "u1",
      name: "Pedro",
      email: "p@e.com",
    });
    await postForgotPassword({ email: "p@e.com" });
    const { tokenHash } = db.passwordResetToken.create.mock.calls[0][0].data;
    const { text } = sendEmail.mock.calls[0][0];
    const token = text.match(/token=([\w-]+)/)[1];
    expect(hashToken(token)).toBe(tokenHash);
  });
});

describe("postResetPassword", () => {
  const input = {
    token: "t",
    password: "novasenha",
    confirmPassword: "novasenha",
  };

  it("recusa token vencido", async () => {
    db.passwordResetToken.findUnique.mockResolvedValue({
      userId: "u1",
      expiresAt: new Date(Date.now() - 1000),
    });
    const result = await postResetPassword(input);
    expect(result.ok).toBe(false);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("troca a senha e invalida os tokens", async () => {
    db.passwordResetToken.findUnique.mockResolvedValue({
      userId: "u1",
      expiresAt: new Date(Date.now() + 60_000),
    });
    expect(await postResetPassword(input)).toEqual({ ok: true });
    expect(db.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
    });
  });
});
