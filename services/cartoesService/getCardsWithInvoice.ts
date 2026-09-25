import "server-only";
import { db } from "@/lib/db";
import { billingCycle, usedLimitCents } from "@/lib/cards";
import { fromISO, toISO } from "@/lib/dates";
import { getUserId } from "@/lib/session";

export interface InvoiceItem {
  id: string;
  description: string;
  date: string;
  icon: string;
  amountCents: number;
}

export interface CardWithInvoice {
  id: string;
  name: string;
  last4: string;
  limitCents: number;
  closingDay: number;
  dueDay: number;
  accountId: string;
  closingDate: string;
  dueDate: string;
  invoiceCents: number;
  usedCents: number;
  items: InvoiceItem[];
}

export async function getCardsWithInvoice(today: string): Promise<CardWithInvoice[]> {
  const userId = await getUserId();
  const cards = await db.creditCard.findMany({
    where: { userId, active: true },
    orderBy: { createdAt: "asc" },
    include: {
      debts: {
        select: { installmentCents: true, totalInstallments: true, paidInstallments: true },
      },
    },
  });

  return Promise.all(
    cards.map(async ({ debts, ...card }) => {
      const cycle = billingCycle(today, card.closingDay, card.dueDay);
      const rows = await db.transaction.findMany({
        where: {
          userId,
          cardId: card.id,
          date: { gt: fromISO(cycle.start), lte: fromISO(cycle.closingDate) },
        },
        select: {
          id: true,
          description: true,
          date: true,
          amountCents: true,
          category: { select: { icon: true } },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      });
      // Estorno (valor positivo) abate da fatura.
      const invoiceCents = -rows.reduce((a, t) => a + t.amountCents, 0);
      return {
        id: card.id,
        name: card.name,
        last4: card.last4,
        limitCents: card.limitCents,
        closingDay: card.closingDay,
        dueDay: card.dueDay,
        accountId: card.accountId,
        closingDate: cycle.closingDate,
        dueDate: cycle.dueDate,
        invoiceCents,
        usedCents: usedLimitCents(invoiceCents, debts),
        items: rows.map((t) => ({
          id: t.id,
          description: t.description,
          date: toISO(t.date),
          icon: t.category.icon,
          amountCents: -t.amountCents,
        })),
      };
    }),
  );
}
