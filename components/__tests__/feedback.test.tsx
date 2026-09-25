import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormError } from "../FormError";
import { PasswordStrength } from "../PasswordStrength";
import { ToastProvider, useToast } from "../Toast";

describe("FormError", () => {
  it("não renderiza nada sem mensagem", () => {
    const { container } = render(<FormError />);
    expect(container).toBeEmptyDOMElement();
  });

  it("anuncia o erro", () => {
    render(<FormError message="Faltou o nome." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Faltou o nome.");
  });
});

describe("PasswordStrength", () => {
  it("pinta as barras conforme a pontuação", () => {
    render(<PasswordStrength password="abc" />);
    const bars = screen.getAllByTestId("password-bar");
    expect(bars[0]).toHaveClass("bg-expense");
    expect(bars[1]).toHaveClass("bg-neutral-800");
    expect(screen.getByText("Fraca. Tipo seu saldo.")).toBeInTheDocument();
  });

  it("fica accent quando a senha é boa", () => {
    render(<PasswordStrength password="abcd12345" />);
    expect(
      screen.getAllByTestId("password-bar").every((b) => b.classList.contains("bg-accent")),
    ).toBe(true);
  });
});

function ToastButton() {
  const toast = useToast();
  function handleClickButton() {
    toast("Anotado. Doeu, mas tá registrado.");
  }
  return <button onClick={handleClickButton}>salvar</button>;
}

describe("Toast", () => {
  it("aparece e some depois de 2,6s", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ToastButton />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent("Anotado. Doeu, mas tá registrado.");
    act(() => {
      vi.advanceTimersByTime(2600);
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    vi.useRealTimers();
  });
});
