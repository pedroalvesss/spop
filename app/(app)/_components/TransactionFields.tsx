"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import { Info } from "@phosphor-icons/react/ssr";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL, parseBRL } from "@/lib/money";
import { CARD_PREFIX, installmentCents, type TransactionInput } from "@/lib/schemas/transaction";
import type { TransactionOptions } from "./transactionTypes";

const FIELD = "min-h-11 rounded-xl";
const INSTALLMENTS = Array.from({ length: 12 }, (_, i) => String(i + 1));

interface TransactionFieldsProps {
  form: UseFormReturn<TransactionInput>;
  options: TransactionOptions;
  showInstallments: boolean;
}

export function TransactionFields({ form, options, showInstallments }: TransactionFieldsProps) {
  const { register, control } = form;
  const [type, amount, installments] = useWatch({
    control,
    name: ["type", "amount", "installments"],
  });
  const out = type === "out";
  const n = Number(installments);
  const total = parseBRL(amount);
  const categories = options.categories.filter((c) => c.type === (out ? "expense" : "income"));

  return (
    <>
      <div>
        <Label htmlFor="tx-description">Descrição</Label>
        <Input
          id="tx-description"
          className={FIELD}
          placeholder={out ? "Ex.: iFood de novo" : "Ex.: Freela, Pix da vó"}
          {...register("description")}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label htmlFor="tx-category">Categoria</Label>
          <Select id="tx-category" className={FIELD} {...register("categoryId")}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="tx-source">Conta</Label>
          <Select id="tx-source" className={FIELD} {...register("source")}>
            {options.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
            {out &&
              options.cards.map((c) => (
                <option key={c.id} value={`${CARD_PREFIX}${c.id}`}>
                  Cartão {c.name}
                </option>
              ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="tx-date">Data</Label>
          <Input id="tx-date" type="date" className={FIELD} {...register("date")} />
        </div>
        {out && showInstallments && (
          <div>
            <Label htmlFor="tx-installments">Parcelas</Label>
            <Select id="tx-installments" className={FIELD} {...register("installments")}>
              {INSTALLMENTS.map((v) => (
                <option key={v} value={v}>
                  {v === "1" ? "À vista" : `${v}x`}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
      {out && showInstallments && n > 1 && total > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Info className="shrink-0" />
          {n}x de {formatBRL(installmentCents(total, n))}. Vai aparecer em Dívidas.
        </div>
      )}
    </>
  );
}
