"use client";

import { RouteError } from "@/components/RouteError";

export default function RegisterError(
  props: React.ComponentProps<typeof RouteError>,
) {
  return <RouteError {...props} />;
}
