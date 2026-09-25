import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "@/app/not-found";

describe("NotFound", () => {
  it("explica com a voz da marca e leva de volta pro início", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading")).toHaveTextContent("Essa página não existe.");
    expect(screen.getByRole("link", { name: "Voltar pro início" })).toHaveAttribute("href", "/");
  });
});
