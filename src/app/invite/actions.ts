"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCoreServerEnvironment } from "@/lib/config/env";
import {
  authenticateInvitationCode,
  INVITATION_ERROR,
} from "@/lib/invitations/access";
import { PostgresInvitationStore } from "@/lib/invitations/postgres-store";
import { INVITATION_SESSION_COOKIE } from "@/lib/auth/invitation-session";

export type InvitationActionState = { error: string | null };

export async function submitInvitationCode(
  _previous: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  const code = formData.get("code");
  if (typeof code !== "string") return { error: INVITATION_ERROR };
  try {
    const environment = getCoreServerEnvironment();
    const requestHeaders = await headers();
    const forwarded = requestHeaders
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim();
    const requesterIdentifier = `${forwarded ?? "unknown"}|${requestHeaders.get("user-agent") ?? "unknown"}`;
    const result = await authenticateInvitationCode({
      code,
      requesterIdentifier,
      pepper: environment.INVITATION_CODE_PEPPER,
      store: new PostgresInvitationStore(),
    });
    if (!result.ok) return { error: INVITATION_ERROR };
    const cookieStore = await cookies();
    cookieStore.set(INVITATION_SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: result.expiresAt,
    });
  } catch {
    return { error: INVITATION_ERROR };
  }
  redirect("/details");
}
