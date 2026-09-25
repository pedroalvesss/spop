import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HideValuesProvider } from "@/components/HideValues";
import { CategoryBreakdownCard } from "../_components/CategoryBreakdownCard";
import { FlowChartCard } from "../_components/FlowChartCard";

const flows = [
  { month: "2026-07", incomeCents: 420000, expenseCents: 461000 },
  { month: "2026-08", incomeCents: 445000, expenseCents: 387000 },
  { month: "2026-09", incomeCents: 469500, expenseCents: 257226 },
];

describe("FlowChartCard", () => {
  it("desenha as barras e destaca o mês atual", () => {
    render(<FlowChartCard flows={flows} />);
    const income = screen.getAllByTestId("income-bar");
    expect(income).toHaveLength(3);
    expect(income[2].style.height).toBe("140px");
    expect(screen.getByText("set")).toHaveClass("text-text");
    expect(screen.getByText("jul", { selector: "span.text-\\[11px\\]" })).toHaveClass(
      "text-neutral-500",
    );
  });

  it("mostra o mês mais salgado e esconde valores quando pedido", () => {
    const { rerender } = render(<FlowChartCard flows={flows} />);
    expect(screen.getByText(/^jul ·/).textContent?.replace(/ /g, " ")).toBe("jul · R$ 4.610,00");
    rerender(
      <HideValuesProvider initialHidden>
        <FlowChartCard flows={flows} />
      </HideValuesProvider>,
    );
    expect(screen.getAllByText(/R\$ ••••/).length).toBeGreaterThan(0);
  });
});

describe("CategoryBreakdownCard", () => {
  it("mostra valor e % de cada categoria", () => {
    render(
      <CategoryBreakdownCard
        monthName="setembro"
        slices={[
          { id: "m", name: "Moradia", icon: "house-line", spentCents: 152840, share: 0.594 },
        ]}
      />,
    );
    expect(screen.getByText("Pra onde foi (setembro)")).toBeInTheDocument();
    expect(screen.getByText(/· 59%/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar").firstElementChild).toHaveClass("bg-accent-500");
  });
});
