"use client";

import { RouteError } from "@/components/RouteError";

export default function LoginError(props: React.ComponentProps<typeof RouteError>) {
  return <RouteError {...props} />;
}
