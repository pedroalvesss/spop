import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../button";

describe("Button", () => {
  it("primary é contorno accent, sem preenchimento", () => {
    render(<Button>Entrar</Button>);
    const btn = screen.getByRole("button", { name: "Entrar" });
    expect(btn).toHaveClass("border-accent", "text-accent");
    expect(btn).not.toHaveClass("text-text");
  });

  it("deixa o className sobrescrever tamanho e raio", () => {
    render(
      <Button variant="ghost" className="rounded-xl text-[15px]">
        Esqueci a senha
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("rounded-xl", "text-[15px]");
    expect(btn).not.toHaveClass("rounded-lg", "text-sm");
  });
});
