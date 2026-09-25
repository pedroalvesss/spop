import "server-only";
import { db } from "@/lib/db";
import { CARD_PREFIX } from "@/lib/schemas/transaction";

interface TransactionRefs {
  accountId: string;
  cardId: string | null;
  categoryId: string;
}

// Confere que conta/cartão/categoria são da pessoa logada antes de gravar qualquer coisa.
export async function resolveTransactionRefs(
  userId: string,
  source: string,
  categoryId: string,
): Promise<TransactionRefs | null> {
  const isCard = source.startsWith(CARD_PREFIX);
  const id = isCard ? source.slice(CARD_PREFIX.length) : source;

  const [category, card, account] = await Promise.all([
    db.category.findFirst({ where: { id: categoryId, userId }, select: { id: true } }),
    isCard ? db.creditCard.findFirst({ where: { id, userId }, select: { accountId: true } }) : null,
    isCard ? null : db.account.findFirst({ where: { id, userId }, select: { id: true } }),
  ]);

  const accountId = isCard ? card?.accountId : account?.id;
  if (!category || !accountId) return null;
  return { accountId, cardId: isCard ? id : null, categoryId };
}
