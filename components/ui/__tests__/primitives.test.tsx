import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { budgetTone, ProgressBar } from "../progress";
import { Segmented } from "../segmented";
import { Tag } from "../tag";
import { CardHeader } from "../card";

describe("ProgressBar", () => {
  it("limita o preenchimento a 100%", () => {
    render(<ProgressBar ratio={1.4} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("muda de cor com o orçamento", () => {
    expect(budgetTone(0.5)).toBe("bg-accent");
    expect(budgetTone(0.85)).toBe("bg-warn");
    expect(budgetTone(1.01)).toBe("bg-expense");
  });
});

describe("Segmented", () => {
  const options = [
    { value: "all", label: "Tudo" },
    { value: "in", label: "Entradas" },
  ] as const;

  it("marca a opção ativa e avisa a troca", async () => {
    const handleChange = vi.fn();
    render(<Segmented label="Filtro" options={[...options]} value="all" onChange={handleChange} />);
    expect(screen.getByRole("button", { name: "Tudo" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Entradas" }));
    expect(handleChange).toHaveBeenCalledWith("in");
  });

  it("vira link quando a opção tem href", () => {
    render(
      <Segmented
        label="Filtro"
        value="all"
        options={[{ value: "all", label: "Tudo", href: "/transacoes" }]}
      />,
    );
    expect(screen.getByRole("link", { name: "Tudo" })).toHaveAttribute("href", "/transacoes");
  });
});

describe("Tag e CardHeader", () => {
  it("pinta a tag pelo tom", () => {
    render(<Tag tone="expense">Estourou</Tag>);
    expect(screen.getByText("Estourou")).toHaveClass("text-expense");
  });

  it("mostra o link de ver todas", () => {
    render(<CardHeader title="Próximas contas" href="/contas" />);
    expect(screen.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/contas");
  });
});
