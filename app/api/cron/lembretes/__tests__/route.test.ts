import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../route";

const mocks = vi.hoisted(() => ({
  getBillReminders: vi.fn(),
  sendPushToUser: vi.fn(),
  sendEmail: vi.fn(),
}));
vi.mock("@/services/notificacoesService/getBillReminders", () => ({
  getBillReminders: mocks.getBillReminders,
}));
vi.mock("@/lib/push", () => ({ sendPushToUser: mocks.sendPushToUser }));
vi.mock("@/lib/email", () => ({ sendEmail: mocks.sendEmail }));
vi.mock("@/lib/dates", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/dates")>()),
  todayISO: () => "2026-09-24",
}));

const internet = {
  id: "b1",
  name: "Internet",
  icon: "wifi-high",
  amountCents: 9990,
  dueDay: 25,
  dueDate: "2026-09-25",
  paid: false,
  categoryId: null,
  accountId: null,
};

function request(token?: string) {
  return new Request("https://spop.app/api/cron/lembretes", {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CRON_SECRET", "segredo");
  vi.stubEnv("APP_URL", "https://spop.app");
});

describe("cron de lembretes", () => {
  it("recusa quem não é o cron", async () => {
    expect((await GET(request())).status).toBe(401);
    expect((await GET(request("errado"))).status).toBe(401);
    expect(mocks.getBillReminders).not.toHaveBeenCalled();
  });

  it("manda push de cada conta e e-mail só pra quem quer", async () => {
    mocks.getBillReminders.mockResolvedValue([
      { userId: "u1", name: "Pedro", email: "p@e.com", emailReminders: true, bills: [internet] },
      { userId: "u2", name: "Ana", email: "a@e.com", emailReminders: false, bills: [internet] },
    ]);
    const response = await GET(request("segredo"));
    expect(await response.json()).toEqual({ people: 2 });
    expect(mocks.getBillReminders).toHaveBeenCalledWith("2026-09-24");
    expect(mocks.sendPushToUser).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ title: "Internet: vence amanhã", url: "/contas" }),
    );
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
    expect(mocks.sendEmail.mock.calls[0][0]).toMatchObject({
      to: "p@e.com",
      subject: "Internet vence amanhã",
    });
  });
});
