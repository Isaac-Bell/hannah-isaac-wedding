import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GuestNavigation } from "@/components/layout/GuestNavigation";
import { requireInvitationSession } from "@/lib/auth/invitation-session";

export const metadata: Metadata = {
  title: "Guest portal",
  robots: { index: false, follow: false },
};

export default async function GuestLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireInvitationSession();
  return (
    <>
      <GuestNavigation partyName={session.invitation.partyName} />
      {children}
    </>
  );
}
