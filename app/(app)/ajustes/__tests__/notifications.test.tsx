import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationsCard } from "../_components/NotificationsCard";
import { urlBase64ToUint8Array } from "../_hooks/usePushSubscription";

const actions = vi.hoisted(() => ({
  postPushSubscription: vi.fn(),
  deletePushSubscription: vi.fn(),
  postTestPush: vi.fn(),
  putUserPreferences: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/actions/notificacoesActions/postPushSubscription", () => ({
  postPushSubscription: actions.postPushSubscription,
}));
vi.mock("@/actions/notificacoesActions/deletePushSubscription", () => ({
  deletePushSubscription: actions.deletePushSubscription,
}));
vi.mock("@/actions/notificacoesActions/postTestPush", () => ({
  postTestPush: actions.postTestPush,
}));
vi.mock("@/actions/ajustesActions/putUserPreferences", () => ({
  putUserPreferences: actions.putUserPreferences,
}));
vi.mock("@/components/Toast", () => ({ useToast: () => actions.toast }));

const subscription = {
  endpoint: "https://push.example/abc",
  toJSON: () => ({ endpoint: "https://push.example/abc", keys: { p256dh: "p", auth: "a" } }),
  unsubscribe: vi.fn(),
};
const pushManager = { getSubscription: vi.fn(), subscribe: vi.fn() };

function installPush(permission: NotificationPermission) {
  Object.defineProperty(navigator, "serviceWorker", {
    value: { ready: Promise.resolve({ pushManager }) },
    configurable: true,
  });
  vi.stubGlobal("PushManager", function PushManager() {});
  vi.stubGlobal("Notification", { permission });
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe("NotificationsCard", () => {
  it("inscreve o aparelho e manda a inscrição pro servidor", async () => {
    installPush("default");
    pushManager.getSubscription.mockResolvedValue(null);
    pushManager.subscribe.mockResolvedValue(subscription);
    render(<NotificationsCard emailReminders />);
    const sw = screen.getByRole("switch", { name: "Avisos neste aparelho" });
    await waitFor(() => expect(sw).toBeEnabled());
    await userEvent.click(sw);
    expect(actions.postPushSubscription).toHaveBeenCalledWith(subscription.toJSON());
    expect(await screen.findByRole("button", { name: "Mandar um aviso de teste" })).toBeVisible();
  });

  it("desinscreve quando desliga", async () => {
    installPush("granted");
    pushManager.getSubscription.mockResolvedValue(subscription);
    render(<NotificationsCard emailReminders />);
    const sw = screen.getByRole("switch", { name: "Avisos neste aparelho" });
    await waitFor(() => expect(sw).toHaveAttribute("data-state", "checked"));
    await userEvent.click(sw);
    expect(actions.deletePushSubscription).toHaveBeenCalledWith("https://push.example/abc");
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });

  it("explica quando o navegador bloqueou", async () => {
    installPush("denied");
    pushManager.getSubscription.mockResolvedValue(null);
    render(<NotificationsCard emailReminders={false} />);
    expect(await screen.findByText(/estão bloqueados/)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Avisos neste aparelho" })).toBeDisabled();
  });

  it("liga e desliga os lembretes por e-mail", async () => {
    installPush("default");
    pushManager.getSubscription.mockResolvedValue(null);
    render(<NotificationsCard emailReminders />);
    await userEvent.click(screen.getByRole("switch", { name: "Lembretes por e-mail" }));
    expect(actions.putUserPreferences).toHaveBeenCalledWith({ emailReminders: false });
  });
});

describe("urlBase64ToUint8Array", () => {
  it("converte base64url pros bytes da chave", () => {
    expect(Array.from(urlBase64ToUint8Array("AQID_-8"))).toEqual([1, 2, 3, 255, 239]);
  });
});
