"use client";

import { putUserModule } from "@/actions/ajustesActions/putUserModule";
import { Icon } from "@/components/Icon";
import { TABS, type ModuleId, type Tab } from "@/lib/tabs";
import { ActionSwitch } from "./ActionSwitch";
import { SettingsCard } from "./SettingsCard";

const MODULE_TABS = TABS.filter((t) => t.id !== "home" && t.id !== "settings");

interface ModuleRowProps {
  tab: Tab;
  enabled: boolean;
}

function ModuleRow({ tab, enabled }: ModuleRowProps) {
  async function handleToggleSwitch(next: boolean) {
    await putUserModule({ module: tab.id as ModuleId, enabled: next });
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <Icon name={tab.icon} className="text-lg text-neutral-400" />
      <span className="flex-1 text-sm">{tab.name}</span>
      <ActionSwitch label={tab.name} checked={enabled} onToggle={handleToggleSwitch} />
    </div>
  );
}

interface ModulesCardProps {
  modules: string[];
}

export function ModulesCard({ modules }: ModulesCardProps) {
  return (
    <SettingsCard
      title="Abas do app"
      description="Mostre só o que faz sentido pra sua vida financeira atual."
    >
      {MODULE_TABS.map((tab) => (
        <ModuleRow key={tab.id} tab={tab} enabled={modules.includes(tab.id)} />
      ))}
    </SettingsCard>
  );
}
