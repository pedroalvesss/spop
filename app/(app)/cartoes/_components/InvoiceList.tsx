import { Money } from "@/components/HideValues";
import { ListRow } from "@/components/ListRow";
import { Card } from "@/components/ui/card";
import { shortDate } from "@/lib/dates";
import type { InvoiceItem } from "@/services/cartoesService/getCardsWithInvoice";

interface InvoiceListProps {
  items: InvoiceItem[];
}

export function InvoiceList({ items }: InvoiceListProps) {
  return (
    <Card className="gap-0 px-4 py-1">
      <div className="pt-3 pb-1 text-[15px] font-medium">Nesta fatura</div>
      {items.map((item) => (
        <ListRow
          key={item.id}
          icon={item.icon}
          title={item.description}
          meta={shortDate(item.date)}
          value={<Money cents={item.amountCents} />}
          className="py-2.5"
        />
      ))}
      {items.length === 0 && (
        <p className="pt-1 pb-3 text-[13px] text-neutral-500">
          Fatura zerada. Aproveita que isso é raro.
        </p>
      )}
    </Card>
  );
}
