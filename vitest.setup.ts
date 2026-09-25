import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// "server-only" explode fora do bundler do Next; nos testes ele é só um marcador.
vi.mock("server-only", () => ({}));
