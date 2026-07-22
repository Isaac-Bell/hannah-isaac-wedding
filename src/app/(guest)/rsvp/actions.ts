"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireInvitationSession } from "@/lib/auth/invitation-session";
import type { RsvpActionState } from "@/lib/rsvp/action-state";
import { rsvpSubmissionFromFormData } from "@/lib/rsvp/form-data";
import { PostgresRsvpRepository } from "@/lib/rsvp/postgres-repository";
import { saveRsvp } from "@/lib/rsvp/service";

const SAVE_ERROR =
  "We couldn’t save your RSVP. Your previous response has not been changed.";

export async function saveRsvpAction(
  previousState: RsvpActionState,
  formData: FormData,
): Promise<RsvpActionState> {
  const session = await requireInvitationSession();
  const rawSubmission = rsvpSubmissionFromFormData(formData);
  let result;
  try {
    result = await saveRsvp({
      repository: new PostgresRsvpRepository(),
      identity: {
        sessionId: session.id,
        invitationId: session.invitation.id,
      },
      rawSubmission,
    });
  } catch {
    return {
      status: "error",
      message: SAVE_ERROR,
      fieldErrors: {},
      step: 2,
      attempt: previousState.attempt + 1,
    };
  }

  if (!result.ok && result.reason === "unauthenticated") redirect("/invite");
  if (!result.ok) {
    const attendanceError = Object.keys(result.fieldErrors).some(
      (field) => field.startsWith("attendance:") || field.startsWith("event:"),
    );
    return {
      status: "error",
      message: "Please correct the highlighted fields and submit again.",
      fieldErrors: result.fieldErrors,
      step: attendanceError ? 1 : 2,
      attempt: previousState.attempt + 1,
    };
  }

  revalidatePath("/rsvp");
  return {
    status: "success",
    message: "Your RSVP has been saved.",
    fieldErrors: {},
    savedAt: result.savedAt.toISOString(),
    attempt: previousState.attempt + 1,
  };
}
