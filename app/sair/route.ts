import { signOut } from "@/auth";

// Sessão órfã (usuário apagado) cai aqui: limpa o cookie e volta pro login.
export async function GET() {
  await signOut({ redirectTo: "/login" });
}
