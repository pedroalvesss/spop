"use client";

import { putUserPreferences } from "@/actions/ajustesActions/putUserPreferences";
import { postTestPush } from "@/actions/notificacoesActions/postTestPush";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePushSubscription } from "../_hooks/usePushSubscription";
import { ActionSwitch } from "./ActionSwitch";
import { SettingsCard } from "./SettingsCard";

const PUSH_HINTS = {
  unsupported:
    "Esse navegador não recebe avisos. No iPhone, adiciona o SPOP! à Tela de Início (Compartilhar → Adicionar à Tela de Início) e abre por lá.",
  denied: "Os avisos estão bloqueados. Libera nas permissões do site e tenta de novo.",
} as const;

interface NotificationsCardProps {
  emailReminders: boolean;
}

export function NotificationsCard({ emailReminders }: NotificationsCardProps) {
  const toast = useToast();
  const { status, subscribe, unsubscribe } = usePushSubscription();
  const hint = status === "unsupported" || status === "denied" ? PUSH_HINTS[status] : null;

  async function handleCheckedChangePushSwitch(next: boolean) {
    if (next) await subscribe();
    else await unsubscribe();
  }

  async function handleToggleEmailSwitch(next: boolean) {
    await putUserPreferences({ emailReminders: next });
  }

  async function handleClickTestButton() {
    await postTestPush();
    toast("Aviso enviado. Olha a notificação.");
  }

  return (
    <SettingsCard
      title="Notificações"
      description="Conta vencendo e orçamento estourando. Sem spam, prometo."
    >
      <div className="flex items-center gap-3 py-2.5">
        <span className="flex-1 text-sm">Avisos neste aparelho</span>
        <Switch
          aria-label="Avisos neste aparelho"
          checked={status === "on"}
          disabled={status === "loading" || status === "unsupported" || status === "denied"}
          onCheckedChange={handleCheckedChangePushSwitch}
        />
      </div>
      {hint && <p className="pb-1 text-xs text-pretty text-neutral-500">{hint}</p>}
      {status === "on" && (
        <Button variant="ghost" className="self-start text-[13px]" onClick={handleClickTestButton}>
          Mandar um aviso de teste
        </Button>
      )}
      <div className="flex items-center gap-3 py-2.5">
        <span className="flex-1 text-sm">Lembretes por e-mail</span>
        <ActionSwitch
          label="Lembretes por e-mail"
          checked={emailReminders}
          onToggle={handleToggleEmailSwitch}
        />
      </div>
    </SettingsCard>
  );
}
