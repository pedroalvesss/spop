import { Money } from "@/components/HideValues";
import { ListRow } from "@/components/ListRow";
import { Card, CardHeader } from "@/components/ui/card";
import { billStatus, type BillView } from "@/lib/bills";

interface NextBillsCardProps {
  bills: BillView[];
  today: string;
}

// As 3 próximas contas não pagas.
export function NextBillsCard({ bills, today }: NextBillsCardProps) {
  const next = bills.filter((b) => !b.paid).slice(0, 3);
  return (
    <Card className="gap-1">
      <CardHeader title="Próximas contas" href="/contas" />
      {next.map((bill) => {
        const status = billStatus(bill, today);
        return (
          <ListRow
            key={bill.id}
            icon={bill.icon}
            title={bill.name}
            meta={status.text}
            metaClassName={status.warn ? "text-warn" : undefined}
            value={<Money cents={bill.amountCents} />}
          />
        );
      })}
      {next.length === 0 && (
        <p className="py-2 text-[13px] text-neutral-500">Tudo pago este mês. Aproveita a paz.</p>
      )}
    </Card>
  );
}
