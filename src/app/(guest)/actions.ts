"use server";

import { redirect } from "next/navigation";
import { forgetCurrentInvitationSession } from "@/lib/auth/invitation-session";

export async function forgetDeviceAction() {
  await forgetCurrentInvitationSession();
  redirect("/invite");
}
