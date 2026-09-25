"use server";

import { signOut } from "@/auth";

export async function postLogout() {
  await signOut({ redirectTo: "/login" });
}
