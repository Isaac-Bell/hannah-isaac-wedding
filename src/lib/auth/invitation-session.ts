import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCoreServerEnvironment } from "@/lib/config/env";
import {
  enforceInvitationSession,
  loadInvitationSession,
  revokeInvitationSession,
} from "@/lib/invitations/access";
import { PostgresInvitationStore } from "@/lib/invitations/postgres-store";

export const INVITATION_SESSION_COOKIE = "wedding_guest_session";

export async function getCurrentInvitationSession() {
  const cookieStore = await cookies();
  const environment = getCoreServerEnvironment();
  return loadInvitationSession({
    token: cookieStore.get(INVITATION_SESSION_COOKIE)?.value,
    pepper: environment.INVITATION_CODE_PEPPER,
    store: new PostgresInvitationStore(),
  });
}

export async function requireInvitationSession() {
  const session = await getCurrentInvitationSession();
  return enforceInvitationSession(session, () => redirect("/invite"));
}

export async function forgetCurrentInvitationSession() {
  const cookieStore = await cookies();
  const environment = getCoreServerEnvironment();
  await revokeInvitationSession({
    token: cookieStore.get(INVITATION_SESSION_COOKIE)?.value,
    pepper: environment.INVITATION_CODE_PEPPER,
    store: new PostgresInvitationStore(),
  });
  cookieStore.delete(INVITATION_SESSION_COOKIE);
}
