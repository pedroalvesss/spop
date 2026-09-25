import { Logo } from "@/components/Logo";

export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3.5">
      <Logo />
      <p className="text-[13px] text-neutral-500">
        Sistema de Pobreza Organizada do Pedro!
      </p>
    </main>
  );
}
