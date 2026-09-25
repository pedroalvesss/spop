import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HideValuesProvider } from "@/components/HideValues";
import { CardActions } from "../_components/CardActions";
import { CardLimit } from "../_components/CardLimit";
import { CardVisual } from "../_components/CardVisual";
import { InvoiceList } from "../_components/InvoiceList";

const { postCard, deleteCardById, toast } = vi.hoisted(() => ({
  postCard: vi.fn(),
  deleteCardById: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/actions/cartoesActions/postCard", () => ({ postCard }));
vi.mock("@/actions/cartoesActions/deleteCardById", () => ({ deleteCardById }));
vi.mock("@/components/Toast", () => ({ useToast: () => toast }));

const accounts = [{ id: "nu", name: "Nubank" }];
const card = {
  id: "c1",
  name: "Nubank",
  last4: "4821",
  limitCents: 400000,
  closingDay: 3,
  dueDay: 10,
  accountId: "nu",
};

beforeEach(() => vi.resetAllMocks());

describe("cartão", () => {
  it("mostra fatura e final do cartão, escondendo o valor quando pedido", () => {
    const { rerender } = render(<CardVisual name="Nubank" last4="4821" invoiceCents={74921} />);
    expect(screen.getByText("•••• 4821")).toBeInTheDocument();
    expect(screen.getByText(/749,21/)).toBeInTheDocument();
    rerender(
      <HideValuesProvider initialHidden>
        <CardVisual name="Nubank" last4="4821" invoiceCents={74921} />
      </HideValuesProvider>,
    );
    expect(screen.getByText("R$ ••••")).toBeInTheDocument();
  });

  it("mostra limite usado e datas de fechamento e vencimento", () => {
    render(
      <CardLimit
        usedCents={191621}
        limitCents={400000}
        closingDate="2026-10-03"
        dueDate="2026-10-10"
      />,
    );
    expect(screen.getByText("03 out")).toBeInTheDocument();
    expect(screen.getByText("10 out")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "48");
  });

  it("lista a fatura ou avisa que está zerada", () => {
    const { rerender } = render(<InvoiceList items={[]} />);
    expect(screen.getByText(/Fatura zerada/)).toBeInTheDocument();
    rerender(
      <InvoiceList
        items={[
          {
            id: "t",
            description: "Netflix",
            date: "2026-09-10",
            icon: "television-simple",
            amountCents: 4490,
          },
        ]}
      />,
    );
    expect(screen.getByText("10 set")).toBeInTheDocument();
  });
});

describe("CardActions", () => {
  it("valida o final do cartão", async () => {
    render(<CardActions card={null} accounts={accounts} />);
    await userEvent.click(screen.getByRole("button", { name: "Adicionar cartão" }));
    await userEvent.type(await screen.findByLabelText("Nome"), "Inter");
    await userEvent.type(screen.getByLabelText("Final"), "12a");
    await userEvent.type(screen.getByLabelText("Limite"), "1000");
    await userEvent.click(screen.getAllByRole("button", { name: "Adicionar cartão" }).at(-1)!);
    expect(await screen.findByRole("alert")).toHaveTextContent("Os 4 últimos números, só dígitos.");
    expect(postCard).not.toHaveBeenCalled();
  });

  it("edita o cartão com os dados atuais", async () => {
    postCard.mockResolvedValue({ ok: true });
    render(<CardActions card={card} accounts={accounts} />);
    await userEvent.click(screen.getByRole("button", { name: "Editar cartão" }));
    expect(await screen.findByLabelText("Limite")).toHaveValue("4000,00");
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(postCard).toHaveBeenCalledWith(expect.objectContaining({ last4: "4821" }), "c1");
    expect(toast).toHaveBeenCalledWith("Cartão atualizado.");
  });
});
