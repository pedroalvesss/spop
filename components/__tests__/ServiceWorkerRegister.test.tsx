import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import manifest from "@/app/manifest";
import { ServiceWorkerRegister } from "../ServiceWorkerRegister";

describe("PWA", () => {
  it("registra o service worker na raiz sem cache", () => {
    const register = vi.fn().mockResolvedValue({});
    Object.defineProperty(navigator, "serviceWorker", { value: { register }, configurable: true });
    render(<ServiceWorkerRegister />);
    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/", updateViaCache: "none" });
  });

  it("manifest instalável, standalone e com as cores da marca", () => {
    const m = manifest();
    expect(m).toMatchObject({ display: "standalone", theme_color: "#161826", start_url: "/" });
    expect(m.icons?.map((i) => i.sizes)).toEqual(["192x192", "512x512", "512x512"]);
  });
});
