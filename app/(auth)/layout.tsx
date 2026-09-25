import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  if ((await auth())?.user) redirect("/");
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-8">
      <div className="w-full max-w-[360px]">{children}</div>
    </main>
  );
}
