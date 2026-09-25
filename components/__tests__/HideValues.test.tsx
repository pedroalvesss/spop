import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Balance, HideValuesProvider, Money, Private, useHideValues } from "../HideValues";

function Toggle() {
  const { toggle } = useHideValues();
  return <button onClick={toggle}>olho</button>;
}

function renderWith(initialHidden: boolean) {
  return render(
    <HideValuesProvider initialHidden={initialHidden}>
      <Toggle />
      <p data-testid="money">
        <Money cents={-5890} signed />
      </p>
      <p data-testid="tx">
        <Money cents={4500} signed hiddenText="••••" />
      </p>
      <p data-testid="balance">
        <Balance cents={128437} />
      </p>
      <p data-testid="private">
        <Private fallback="Valores ocultos">Sobraram R$ 10,00</Private>
      </p>
    </HideValuesProvider>,
  );
}

describe("ocultar valores", () => {
  it("mostra os valores formatados", () => {
    renderWith(false);
    expect(screen.getByTestId("money").textContent?.replace(/ /g, " ")).toBe("− R$ 58,90");
    expect(screen.getByText(",37")).toHaveClass("text-neutral-500");
    expect(screen.getByTestId("private")).toHaveTextContent("Sobraram R$ 10,00");
  });

  it("esconde tudo que é dinheiro ao tocar no olho", async () => {
    renderWith(false);
    await userEvent.click(screen.getByRole("button", { name: "olho" }));
    expect(screen.getByTestId("money")).toHaveTextContent("R$ ••••");
    expect(screen.getByTestId("tx")).toHaveTextContent(/^••••$/);
    expect(screen.getByTestId("balance")).toHaveTextContent("R$ ••••");
    expect(screen.getByTestId("private")).toHaveTextContent("Valores ocultos");
  });

  it("respeita a preferência de abrir escondido", () => {
    renderWith(true);
    expect(screen.getByTestId("balance")).toHaveTextContent("R$ ••••");
  });
});
