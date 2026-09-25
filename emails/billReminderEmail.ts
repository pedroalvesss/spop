// Template provisório. O design final vem do Claude Design.
import { billStatus, type BillView } from "@/lib/bills";
import { formatBRL } from "@/lib/money";
import { escapeHtml } from "./passwordResetEmail";

type ReminderBill = Pick<BillView, "name" | "amountCents" | "paid" | "dueDate">;

export function billReminderEmail(
  name: string,
  bills: ReminderBill[],
  today: string,
  appUrl: string,
) {
  const lines = bills.map((b) => ({
    name: b.name,
    status: billStatus(b, today).text.toLowerCase(),
    value: formatBRL(b.amountCents),
  }));
  const subject =
    lines.length === 1
      ? `${lines[0].name} ${lines[0].status}`
      : `${lines.length} contas vencendo. Bora resolver?`;

  return {
    subject,
    text: [
      `Oi, ${name}.`,
      "",
      ...lines.map((l) => `• ${l.name}: ${l.value}, ${l.status}`),
      "",
      `Marca como paga no app: ${appUrl}/contas`,
      "A sensação é ótima, mas dura pouco.",
    ].join("\n"),
    html: [
      `<p>Oi, ${escapeHtml(name)}.</p>`,
      "<ul>",
      ...lines.map(
        (l) => `<li><strong>${escapeHtml(l.name)}</strong>: ${l.value}, ${l.status}</li>`,
      ),
      "</ul>",
      `<p><a href="${appUrl}/contas">Marcar como paga no app</a></p>`,
      "<p>A sensação é ótima, mas dura pouco.</p>",
    ].join(""),
  };
}
