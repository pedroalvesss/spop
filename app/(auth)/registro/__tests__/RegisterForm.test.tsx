import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "../_components/RegisterForm";

const router = { replace: vi.fn(), refresh: vi.fn() };
const toast = vi.fn();
const postRegister = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/components/Toast", () => ({ useToast: () => toast }));
vi.mock("@/actions/authActions/postRegister", () => ({
  postRegister: (d: unknown) => postRegister(d),
}));

async function fill(
  name: string,
  email: string,
  password: string,
  confirm: string,
) {
  if (name) await userEvent.type(screen.getByLabelText("Como te chamo?"), name);
  if (email) await userEvent.type(screen.getByLabelText("E-mail"), email);
  if (password) await userEvent.type(screen.getByLabelText("Senha"), password);
  if (confirm)
    await userEvent.type(screen.getByLabelText("Confirmar senha"), confirm);
  await userEvent.click(
    screen.getByRole("button", { name: "Começar a organizar" }),
  );
}

describe("RegisterForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mostra um erro por vez, na ordem dos campos", async () => {
    render(<RegisterForm />);
    await fill("", "pedro", "123", "321");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Faltou o nome.",
    );
  });

  it("confere se as senhas batem", async () => {
    render(<RegisterForm />);
    await fill("Pedro", "p@e.com", "123456", "654321");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "As senhas não batem.",
    );
    expect(postRegister).not.toHaveBeenCalled();
  });

  it("atualiza o medidor de força enquanto digita", async () => {
    render(<RegisterForm />);
    expect(screen.getByText("Força da senha")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Senha"), "abcd12345");
    expect(screen.getByText(/Forte\./)).toBeInTheDocument();
  });

  it("cria a conta e dá boas-vindas", async () => {
    postRegister.mockResolvedValue({ ok: true, name: "Pedro" });
    render(<RegisterForm />);
    await fill("Pedro", "p@e.com", "123456", "123456");
    expect(toast).toHaveBeenCalledWith(
      "Conta criada. Bem-vindo à pobreza organizada.",
    );
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("mostra erro do servidor (e-mail repetido)", async () => {
    postRegister.mockResolvedValue({
      ok: false,
      error: "Esse e-mail já tem conta. Tenta entrar.",
    });
    render(<RegisterForm />);
    await fill("Pedro", "p@e.com", "123456", "123456");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Esse e-mail já tem conta.",
    );
  });
});
