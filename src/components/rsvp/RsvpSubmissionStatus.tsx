import { formatRsvpTimestamp } from "@/lib/rsvp/display";

export function RsvpSubmissionStatus({
  updatedAt,
}: {
  updatedAt: string | null;
}) {
  return (
    <div role="status">
      {updatedAt ? (
        <p>
          Previously submitted. Last saved{" "}
          <strong>{formatRsvpTimestamp(updatedAt)} CT</strong>.
        </p>
      ) : (
        <p>This household has not submitted an RSVP yet.</p>
      )}
    </div>
  );
}
