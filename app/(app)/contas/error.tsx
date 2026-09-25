"use client";

import { RouteError } from "@/components/RouteError";

export default function BillsError(props: React.ComponentProps<typeof RouteError>) {
  return <RouteError {...props} />;
}
