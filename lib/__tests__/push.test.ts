import { beforeEach, describe, expect, it, vi } from "vitest";

const { webpush, db } = vi.hoisted(() => ({
  webpush: { setVapidDetails: vi.fn(), sendNotification: vi.fn() },
  db: { pushSubscription: { findMany: vi.fn(), deleteMany: vi.fn() } },
}));
vi.mock("web-push", () => ({ default: webpush }));
vi.mock("@/lib/db", () => ({ db }));

async function loadPush() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "pub");
  vi.stubEnv("VAPID_PRIVATE_KEY", "priv");
  return import("../push");
}

beforeEach(() => vi.clearAllMocks());

describe("sendPushToUser", () => {
  it("manda pra cada aparelho e apaga inscrição que morreu", async () => {
    const { sendPushToUser } = await loadPush();
    db.pushSubscription.findMany.mockResolvedValue([
      { id: "s1", endpoint: "https://a", p256dh: "p", auth: "a" },
      { id: "s2", endpoint: "https://b", p256dh: "p", auth: "a" },
    ]);
    webpush.sendNotification
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(Object.assign(new Error("gone"), { statusCode: 410 }));

    await sendPushToUser("u1", { title: "Oi", body: "Teste" });

    expect(webpush.sendNotification).toHaveBeenCalledWith(
      { endpoint: "https://a", keys: { p256dh: "p", auth: "a" } },
      JSON.stringify({ title: "Oi", body: "Teste" }),
    );
    expect(db.pushSubscription.deleteMany).toHaveBeenCalledWith({ where: { id: "s2" } });
  });

  it("sem chaves VAPID não faz nada", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "");
    const { sendPushToUser } = await import("../push");
    await sendPushToUser("u1", { title: "Oi", body: "Teste" });
    expect(db.pushSubscription.findMany).not.toHaveBeenCalled();
  });
});
