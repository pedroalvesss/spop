import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "../Logo";

describe("Logo", () => {
  it("escreve o nome em minúsculas com o ! na cor da marca", () => {
    render(<Logo />);
    expect(screen.getByText("!")).toHaveClass("text-accent");
    expect(screen.getByText("!").parentElement).toHaveTextContent("spop!");
  });

  it("usa o símbolo engrossado nos tamanhos pequenos", () => {
    const { container } = render(<Logo size="sm" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "26");
    expect(svg.querySelector("circle")).toHaveAttribute("stroke-width", "4");
  });
});
