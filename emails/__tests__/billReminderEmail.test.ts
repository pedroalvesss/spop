import { describe, expect, it } from "vitest";
import { billReminderEmail } from "../billReminderEmail";

const bill = (name: string, dueDate: string) => ({ name, amountCents: 9990, paid: false, dueDate });

describe("billReminderEmail", () => {
  it("assunto com o nome quando é uma conta só", () => {
    const email = billReminderEmail(
      "Pedro",
      [bill("Internet", "2026-09-24")],
      "2026-09-24",
      "https://spop.app",
    );
    expect(email.subject).toBe("Internet vence hoje");
    expect(email.text).toContain("https://spop.app/contas");
  });

  it("assunto com a contagem e HTML escapado quando são várias", () => {
    const email = billReminderEmail(
      "<Pedro>",
      [bill("Luz", "2026-09-24"), bill("<Água>", "2026-09-25")],
      "2026-09-24",
      "https://spop.app",
    );
    expect(email.subject).toBe("2 contas vencendo. Bora resolver?");
    expect(email.html).not.toContain("<Água>");
    expect(email.html).not.toContain("<Pedro>");
  });
});
