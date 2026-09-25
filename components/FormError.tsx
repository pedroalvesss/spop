import { WarningCircle } from "@phosphor-icons/react/ssr";

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-center gap-1.5 text-[13px] text-expense">
      <WarningCircle className="shrink-0" />
      {message}
    </div>
  );
}
