import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../_components/LoginForm";

const router = { replace: vi.fn(), refresh: vi.fn() };
const toast = vi.fn();
const postLogin = vi.fn();
const postForgotPassword = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/components/Toast", () => ({ useToast: () => toast }));
vi.mock("@/actions/authActions/postLogin", () => ({
  postLogin: (d: unknown) => postLogin(d),
}));
vi.mock("@/actions/authActions/postForgotPassword", () => ({
  postForgotPassword: (d: unknown) => postForgotPassword(d),
}));

async function fillAndSubmit(email: string, password: string) {
  if (email) await userEvent.type(screen.getByLabelText("E-mail"), email);
  if (password) await userEvent.type(screen.getByLabelText("Senha"), password);
  await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("LoginForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reclama de e-mail inválido sem chamar o servidor", async () => {
    render(<LoginForm />);
    await fillAndSubmit("pedro", "123456");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Esse e-mail não parece um e-mail.",
    );
    expect(postLogin).not.toHaveBeenCalled();
  });

  it("mostra o erro do servidor e limpa quando a pessoa digita", async () => {
    postLogin.mockResolvedValue({
      ok: false,
      error: "Senha errada. Pelo menos o dinheiro tá seguro.",
    });
    render(<LoginForm />);
    await fillAndSubmit("pedro@email.com", "errada");
    expect(await screen.findByRole("alert")).toHaveTextContent("Senha errada.");
    await userEvent.type(screen.getByLabelText("Senha"), "x");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("entra, cumprimenta pelo nome e vai pro início", async () => {
    postLogin.mockResolvedValue({ ok: true, name: "Pedro" });
    render(<LoginForm />);
    await fillAndSubmit("Pedro@Email.com", "123456");
    expect(postLogin).toHaveBeenCalledWith({
      email: "pedro@email.com",
      password: "123456",
    });
    expect(toast).toHaveBeenCalledWith("Oi, Pedro. Vamos ver o estrago?");
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("esqueci a senha pede o e-mail antes de enviar o link", async () => {
    render(<LoginForm />);
    await userEvent.click(
      screen.getByRole("button", { name: "Esqueci a senha" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Esse e-mail não parece um e-mail.",
    );
    await userEvent.type(screen.getByLabelText("E-mail"), "pedro@email.com");
    await userEvent.click(
      screen.getByRole("button", { name: "Esqueci a senha" }),
    );
    expect(postForgotPassword).toHaveBeenCalledWith({
      email: "pedro@email.com",
    });
    expect(toast).toHaveBeenCalledWith(
      "Link enviado pro seu e-mail. Anota a senha dessa vez.",
    );
  });

  it("leva pro cadastro", () => {
    render(<LoginForm />);
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/registro",
    );
  });
});
