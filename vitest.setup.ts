import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(cleanup);

// "server-only" explode fora do bundler do Next; nos testes ele é só um marcador.
vi.mock("server-only", () => ({}));
