import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResetPasswordForm } from "../_components/ResetPasswordForm";

const router = { replace: vi.fn() };
const toast = vi.fn();
const postResetPassword = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/components/Toast", () => ({ useToast: () => toast }));
vi.mock("@/actions/authActions/postResetPassword", () => ({
  postResetPassword: (d: unknown) => postResetPassword(d),
}));

describe("ResetPasswordForm", () => {
  it("manda o token junto e volta pro login", async () => {
    postResetPassword.mockResolvedValue({ ok: true });
    render(<ResetPasswordForm token="abc" />);
    await userEvent.type(screen.getByLabelText("Nova senha"), "novasenha1");
    await userEvent.type(screen.getByLabelText("Confirmar senha"), "novasenha1");
    await userEvent.click(screen.getByRole("button", { name: "Salvar senha" }));
    expect(postResetPassword).toHaveBeenCalledWith({
      token: "abc",
      password: "novasenha1",
      confirmPassword: "novasenha1",
    });
    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  it("mostra quando o link expirou", async () => {
    postResetPassword.mockResolvedValue({
      ok: false,
      error: "Esse link expirou.",
    });
    render(<ResetPasswordForm token="velho" />);
    await userEvent.type(screen.getByLabelText("Nova senha"), "123456");
    await userEvent.type(screen.getByLabelText("Confirmar senha"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Salvar senha" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Esse link expirou.");
  });
});
