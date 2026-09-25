"use client";

import { useState } from "react";
import { SignOut } from "@phosphor-icons/react/ssr";
import { postLogout } from "@/actions/authActions/postLogout";
import { putUserPreferences } from "@/actions/ajustesActions/putUserPreferences";
import { Tag } from "@/components/ui/tag";
import { ActionSwitch } from "./ActionSwitch";
import { SalaryDayForm } from "./SalaryDayForm";
import { SettingsCard } from "./SettingsCard";

interface PreferencesCardProps {
  hideValuesOnOpen: boolean;
  billCreatesTransaction: boolean;
  salaryDay: number;
}

export function PreferencesCard({
  hideValuesOnOpen,
  billCreatesTransaction,
  salaryDay,
}: PreferencesCardProps) {
  const [editingSalary, setEditingSalary] = useState(false);

  async function handleToggleHideSwitch(next: boolean) {
    await putUserPreferences({ hideValuesOnOpen: next });
  }

  async function handleToggleBillSwitch(next: boolean) {
    await putUserPreferences({ billCreatesTransaction: next });
  }

  function handleClickSalaryButton() {
    setEditingSalary(true);
  }

  return (
    <SettingsCard>
      <div className="flex items-center gap-3 py-2.5">
        <span className="flex-1 text-sm">Moeda</span>
        <Tag tone="neutral">BRL · R$</Tag>
      </div>
      <button
        type="button"
        onClick={handleClickSalaryButton}
        className="flex items-center gap-3 py-2.5 text-left"
      >
        <span className="flex-1 text-sm">Dia do salário</span>
        <span className="text-sm text-neutral-400">Dia {salaryDay}</span>
      </button>
      <div className="flex items-center gap-3 py-2.5">
        <span className="flex-1 text-sm">Esconder valores ao abrir</span>
        <ActionSwitch
          label="Esconder valores ao abrir"
          checked={hideValuesOnOpen}
          onToggle={handleToggleHideSwitch}
        />
      </div>
      <div className="flex items-center gap-3 py-2.5">
        <span className="flex-1 text-sm">Conta paga vira lançamento</span>
        <ActionSwitch
          label="Conta paga vira lançamento"
          checked={billCreatesTransaction}
          onToggle={handleToggleBillSwitch}
        />
      </div>
      <form action={postLogout}>
        <button type="submit" className="flex items-center gap-2 py-3 text-sm text-expense">
          <SignOut />
          Sair da conta
        </button>
      </form>
      {editingSalary && <SalaryDayForm salaryDay={salaryDay} onOpenChange={setEditingSalary} />}
    </SettingsCard>
  );
}
