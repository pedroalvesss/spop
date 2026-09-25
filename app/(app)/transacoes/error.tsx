"use client";

import { RouteError } from "@/components/RouteError";

export default function TransactionsError(props: React.ComponentProps<typeof RouteError>) {
  return <RouteError {...props} />;
}
