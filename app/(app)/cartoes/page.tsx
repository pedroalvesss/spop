import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { CardGrid } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { todayISO } from "@/lib/dates";
import { getActiveAccounts } from "@/services/bancosService/getActiveAccounts";
import { getCardsWithInvoice } from "@/services/cartoesService/getCardsWithInvoice";
import { requireModule } from "@/services/usuariosService/getCurrentUser";
import { CardActions } from "./_components/CardActions";
import { CardLimit } from "./_components/CardLimit";
import { CardVisual } from "./_components/CardVisual";
import { InvoiceList } from "./_components/InvoiceList";

export const metadata: Metadata = { title: "Cartões · SPOP!" };

export default async function CardsPage({ searchParams }: PageProps<"/cartoes">) {
  await requireModule("cards");
  const [{ cartao }, cards, accounts] = await Promise.all([
    searchParams,
    getCardsWithInvoice(todayISO()),
    getActiveAccounts(),
  ]);
  const card = cards.find((c) => c.id === cartao) ?? cards[0];

  if (!card) {
    return (
      <div className="flex flex-col gap-3.5">
        <EmptyState>Nenhum cartão por aqui. Pelo menos a fatura é zero.</EmptyState>
        <CardActions card={null} accounts={accounts} />
      </div>
    );
  }

  // Pro client vai só o que o formulário de edição usa.
  const { id, name, last4, limitCents, closingDay, dueDay, accountId } = card;
  const editableCard = { id, name, last4, limitCents, closingDay, dueDay, accountId };

  return (
    <CardGrid className="items-start">
      <div className="flex flex-col gap-3.5">
        {cards.length > 1 && (
          <Segmented
            label="Escolher cartão"
            value={card.id}
            className="max-w-[380px]"
            options={cards.map((c) => ({
              value: c.id,
              label: c.name,
              href: `/cartoes?cartao=${c.id}`,
            }))}
          />
        )}
        <CardVisual name={card.name} last4={card.last4} invoiceCents={card.invoiceCents} />
        <CardLimit
          usedCents={card.usedCents}
          limitCents={card.limitCents}
          closingDate={card.closingDate}
          dueDate={card.dueDate}
        />
        <CardActions card={editableCard} accounts={accounts} />
      </div>
      <InvoiceList items={card.items} />
    </CardGrid>
  );
}
