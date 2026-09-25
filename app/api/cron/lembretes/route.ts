import { billReminderEmail } from "@/emails/billReminderEmail";
import { syncAllBanks } from "@/lib/bankSync";
import { todayISO } from "@/lib/dates";
import { sendEmail } from "@/lib/email";
import { billPush } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/push";
import { getBillReminders } from "@/services/notificacoesService/getBillReminders";

// Chamado pelo Vercel Cron (vercel.json), que manda "Authorization: Bearer $CRON_SECRET".
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const today = todayISO();
  const reminders = await getBillReminders(today);
  const appUrl = process.env.APP_URL ?? new URL(request.url).origin;

  await Promise.all(
    reminders.map(async (r) => {
      await Promise.all(r.bills.map((bill) => sendPushToUser(r.userId, billPush(bill, today))));
      if (r.emailReminders) {
        await sendEmail({ to: r.email, ...billReminderEmail(r.name, r.bills, today, appUrl) });
      }
    }),
  );

  const banks = await syncAllBanks();

  return Response.json({ people: reminders.length, banks });
}
