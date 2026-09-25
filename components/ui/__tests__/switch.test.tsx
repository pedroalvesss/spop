import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../switch";

describe("Switch", () => {
  it("alterna e avisa o novo estado", async () => {
    const handleChange = vi.fn();
    render(<Switch aria-label="Esconder valores" onCheckedChange={handleChange} />);
    const sw = screen.getByRole("switch", { name: "Esconder valores" });
    expect(sw).toHaveAttribute("data-state", "unchecked");
    await userEvent.click(sw);
    expect(handleChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute("data-state", "checked");
  });
});
