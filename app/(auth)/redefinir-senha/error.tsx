"use client";

import { RouteError } from "@/components/RouteError";

export default function ResetPasswordError(
  props: React.ComponentProps<typeof RouteError>,
) {
  return <RouteError {...props} />;
}
