import "server-only";

const API = "https://api.pluggy.ai";

let cachedKey: { value: string; expiresAt: number } | null = null;

export function pluggyEnabled() {
  return Boolean(process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_CLIENT_SECRET);
}

// A API key da Pluggy vale 2h; guarda por 1h30 pra não pedir uma a cada chamada.
async function apiKey() {
  if (cachedKey && cachedKey.expiresAt > Date.now()) return cachedKey.value;
  const res = await fetch(`${API}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Pluggy /auth respondeu ${res.status}`);
  const { apiKey: value } = (await res.json()) as { apiKey: string };
  cachedKey = { value, expiresAt: Date.now() + 90 * 60_000 };
  return value;
}

// GET autenticado. 404 vira null; qualquer outro erro sobe.
export async function pluggyGet<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API}${path}`, {
    headers: { "X-API-KEY": await apiKey() },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Pluggy ${path} respondeu ${res.status}`);
  return (await res.json()) as T;
}
