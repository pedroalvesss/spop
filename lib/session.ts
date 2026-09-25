import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// React.cache: várias leituras na mesma requisição resolvem a sessão uma vez só.
export const getUserId = cache(async (): Promise<string> => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
});
