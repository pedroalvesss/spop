import { beforeEach, describe, expect, it, vi } from "vitest";
import { postPushSubscription } from "../postPushSubscription";
import { deletePushSubscription } from "../deletePushSubscription";
import { postTestPush } from "../postTestPush";

const { db, sendPushToUser } = vi.hoisted(() => ({
  db: { pushSubscription: { upsert: vi.fn(), deleteMany: vi.fn() } },
  sendPushToUser: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/push", () => ({ sendPushToUser }));
vi.mock("@/lib/session", () => ({ getUserId: async () => "u1" }));

beforeEach(() => vi.clearAllMocks());

describe("inscrição de push", () => {
  it("guarda o aparelho, trocando de dono se o endpoint já existia", async () => {
    await postPushSubscription({
      endpoint: "https://push.example/x",
      keys: { p256dh: "p", auth: "a" },
    });
    expect(db.pushSubscription.upsert).toHaveBeenCalledWith({
      where: { endpoint: "https://push.example/x" },
      create: { userId: "u1", endpoint: "https://push.example/x", p256dh: "p", auth: "a" },
      update: { userId: "u1", p256dh: "p", auth: "a" },
    });
  });

  it("recusa inscrição malformada", async () => {
    await expect(postPushSubscription({ endpoint: "não é url" })).rejects.toThrow();
  });

  it("remove só o aparelho da própria pessoa", async () => {
    await deletePushSubscription("https://push.example/x");
    expect(db.pushSubscription.deleteMany).toHaveBeenCalledWith({
      where: { endpoint: "https://push.example/x", userId: "u1" },
    });
  });

  it("aviso de teste vai pra pessoa logada", async () => {
    await postTestPush();
    expect(sendPushToUser).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ title: "Tá funcionando." }),
    );
  });
});
