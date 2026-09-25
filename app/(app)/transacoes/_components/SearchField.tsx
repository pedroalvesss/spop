"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 300;

interface SearchFieldProps {
  defaultValue: string;
}

export function SearchField({ defaultValue }: SearchFieldProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleChangeSearchInput(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.trim();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set("q", value);
      else params.delete("q");
      params.delete("limite");
      router.replace(`${pathname}?${params}`, { scroll: false });
    }, DEBOUNCE_MS);
  }

  return (
    <div className="relative flex-[1_1_240px]">
      <MagnifyingGlass className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500" />
      <Input
        type="search"
        aria-label="Buscar lançamentos"
        defaultValue={defaultValue}
        placeholder="Buscar (ex.: iFood, pra se torturar)"
        className="min-h-[42px] rounded-xl pl-[34px]"
        onChange={handleChangeSearchInput}
      />
    </div>
  );
}
