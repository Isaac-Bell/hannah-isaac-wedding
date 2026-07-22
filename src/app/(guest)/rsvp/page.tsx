import { RsvpForm } from "@/components/rsvp/RsvpForm";
import { RsvpSubmissionStatus } from "@/components/rsvp/RsvpSubmissionStatus";
import { requireInvitationSession } from "@/lib/auth/invitation-session";
import { PostgresRsvpRepository } from "@/lib/rsvp/postgres-repository";
import { saveRsvpAction } from "./actions";
import styles from "../guest.module.css";

export default async function RsvpPage() {
  const session = await requireInvitationSession();
  const household = await new PostgresRsvpRepository().loadHousehold(
    session.invitation.id,
  );

  if (!household || household.guests.length === 0) {
    return (
      <main className={`container ${styles.page}`}>
        <p className="eyebrow">Your household</p>
        <h1>RSVP</h1>
        <div className={styles.card} role="status">
          <h2>We’re preparing your RSVP</h2>
          <p>
            We couldn’t find any guests attached to this invitation. Please
            contact Hannah or Isaac so they can help.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={`container ${styles.page}`}>
      <p className="eyebrow">Your household</p>
      <h1>RSVP</h1>
      <p className={styles.lede}>
        Responding for <strong>{household.partyName}</strong>. You can return to
        this page and update your response later.
      </p>
      <div className={styles.card}>
        <RsvpSubmissionStatus
          updatedAt={household.response?.updatedAt.toISOString() ?? null}
        />
      </div>
      <section aria-label="Household RSVP">
        <RsvpForm
          action={saveRsvpAction}
          household={{
            partyName: household.partyName,
            contactEmail: household.response?.contactEmail ?? "",
            contactPhone: household.response?.contactPhone ?? "",
            songRequest: household.response?.songRequest ?? "",
            message: household.response?.message ?? "",
            guests: household.guests.map((guest) => ({
              id: guest.id,
              fullName: guest.fullName,
              allowedEvents: guest.allowedEvents,
              response: {
                attending: guest.response?.attending ?? null,
                dietaryRequirements: guest.response?.dietaryRequirements ?? "",
                accessibilityRequirements:
                  guest.response?.accessibilityRequirements ?? "",
                eventChoices: guest.response?.eventChoices ?? {},
              },
            })),
          }}
        />
      </section>
    </main>
  );
}
