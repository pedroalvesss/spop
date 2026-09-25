"use client";

import { RouteError } from "@/components/RouteError";

export default function GoalsError(props: React.ComponentProps<typeof RouteError>) {
  return <RouteError {...props} />;
}
