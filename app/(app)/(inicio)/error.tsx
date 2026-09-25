"use client";

import { RouteError } from "@/components/RouteError";

export default function HomeError(props: React.ComponentProps<typeof RouteError>) {
  return <RouteError {...props} />;
}
