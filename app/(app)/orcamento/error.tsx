"use client";

import { RouteError } from "@/components/RouteError";

export default function BudgetError(props: React.ComponentProps<typeof RouteError>) {
  return <RouteError {...props} />;
}
