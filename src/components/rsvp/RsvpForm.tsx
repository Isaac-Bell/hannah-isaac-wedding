"use client";

import { useActionState, useState } from "react";
import { AttendanceControl } from "@/components/ui/AttendanceControl";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { TextArea, TextInput } from "@/components/ui/FormFields";
import { InformationCard } from "@/components/ui/InformationCard";
import { RSVPProgress } from "@/components/ui/RSVPProgress";
import {
  initialRsvpActionState,
  type RsvpActionState,
} from "@/lib/rsvp/action-state";
import { formatRsvpTimestamp } from "@/lib/rsvp/display";
import { RSVP_FIELD_LIMITS } from "@/lib/rsvp/validation";
import styles from "./rsvp.module.css";

export type RsvpFormHousehold = {
  partyName: string;
  contactEmail: string;
  contactPhone: string;
  songRequest: string;
  message: string;
  guests: Array<{
    id: string;
    fullName: string;
    allowedEvents: Array<{
      key: string;
      label: string;
      description: string;
    }>;
    response: {
      attending: boolean | null;
      dietaryRequirements: string;
      accessibilityRequirements: string;
      eventChoices: Record<string, boolean>;
    };
  }>;
};

export type RsvpFormAction = (
  state: RsvpActionState,
  formData: FormData,
) => Promise<RsvpActionState>;

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className={styles.fieldError} id={id}>
      {messages.join(" ")}
    </p>
  );
}

export function RsvpForm({
  action,
  household,
}: {
  action: RsvpFormAction;
  household: RsvpFormHousehold;
}) {
  const [actionState, formAction, pending] = useActionState(
    action,
    initialRsvpActionState,
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [handledAttempt, setHandledAttempt] = useState(0);
  const [missingAttendance, setMissingAttendance] = useState<Set<string>>(
    new Set(),
  );
  const [attendance, setAttendance] = useState<
    Record<string, "yes" | "no" | "">
  >(
    Object.fromEntries(
      household.guests.map((guest) => [
        guest.id,
        guest.response.attending === true
          ? "yes"
          : guest.response.attending === false
            ? "no"
            : "",
      ]),
    ),
  );

  const displayedStep =
    actionState.status === "error" && actionState.attempt > handledAttempt
      ? actionState.step
      : step;

  function goToStep(nextStep: 1 | 2) {
    setHandledAttempt(actionState.attempt);
    setStep(nextStep);
  }

  function continueToDetails() {
    const missing = new Set(
      household.guests
        .filter((guest) => !attendance[guest.id])
        .map((guest) => guest.id),
    );
    setMissingAttendance(missing);
    if (missing.size === 0) goToStep(2);
  }

  function fieldErrors(name: string) {
    return actionState.fieldErrors[name];
  }

  return (
    <form action={formAction} className={styles.form} noValidate>
      <RSVPProgress step={displayedStep} total={2} />

      {actionState.status === "success" && (
        <FeedbackMessage tone="success">
          {actionState.message} Last updated{" "}
          {formatRsvpTimestamp(actionState.savedAt)} CT.
        </FeedbackMessage>
      )}
      {actionState.status === "error" && (
        <FeedbackMessage>{actionState.message}</FeedbackMessage>
      )}
      <FieldError id="rsvp-form-error" messages={fieldErrors("form")} />

      <section className={styles.step} hidden={displayedStep !== 1}>
        <div className={styles.stepHeading}>
          <p className="eyebrow">Step one</p>
          <h2>Who will be joining us?</h2>
          <p>Choose an attendance response for every invited guest.</p>
        </div>
        <div className={styles.guestGrid}>
          {household.guests.map((guest) => {
            const attendanceName = `attendance:${guest.id}`;
            const attendanceErrors = fieldErrors(attendanceName);
            const attendanceErrorId = `${attendanceName}-error`;
            const missing = missingAttendance.has(guest.id);
            return (
              <InformationCard className={styles.guestCard} key={guest.id}>
                <input name="guestId" type="hidden" value={guest.id} />
                <AttendanceControl
                  error={missing || Boolean(attendanceErrors?.length)}
                  errorMessageId={attendanceErrorId}
                  legend={guest.fullName}
                  name={attendanceName}
                  onChange={(value) => {
                    setAttendance((current) => ({
                      ...current,
                      [guest.id]: value,
                    }));
                    setMissingAttendance((current) => {
                      const next = new Set(current);
                      next.delete(guest.id);
                      return next;
                    });
                  }}
                  value={attendance[guest.id]}
                />
                <FieldError
                  id={attendanceErrorId}
                  messages={
                    missing
                      ? [`Choose a response for ${guest.fullName}.`]
                      : attendanceErrors
                  }
                />
                {attendance[guest.id] === "yes" &&
                  guest.allowedEvents.map((event) => {
                    const eventName = `event:${guest.id}:${event.key}`;
                    const eventErrorId = `${eventName}-error`;
                    return (
                      <div className={styles.event} key={event.key}>
                        <label>
                          <input
                            aria-describedby={
                              fieldErrors(eventName)?.length
                                ? eventErrorId
                                : undefined
                            }
                            aria-invalid={
                              fieldErrors(eventName)?.length ? true : undefined
                            }
                            defaultChecked={
                              guest.response.eventChoices[event.key] === true
                            }
                            name={eventName}
                            type="checkbox"
                            value="true"
                          />
                          <span>
                            <strong>{event.label}</strong>
                            <span>{event.description}</span>
                          </span>
                        </label>
                        <FieldError
                          id={eventErrorId}
                          messages={fieldErrors(eventName)}
                        />
                      </div>
                    );
                  })}
              </InformationCard>
            );
          })}
        </div>
        <Button fullWidth onClick={continueToDetails} type="button">
          Continue to details
        </Button>
      </section>

      <section className={styles.step} hidden={displayedStep !== 2}>
        <div className={styles.stepHeading}>
          <p className="eyebrow">Step two</p>
          <h2>Details for your household</h2>
          <p>
            Please provide at least one contact method so we can reach your
            household if plans change.
          </p>
        </div>
        <div className={styles.fields}>
          {household.guests
            .filter((guest) => attendance[guest.id] === "yes")
            .map((guest) => {
              const dietaryName = `dietary:${guest.id}`;
              const accessibilityName = `accessibility:${guest.id}`;
              return (
                <InformationCard className={styles.guestDetails} key={guest.id}>
                  <h3>{guest.fullName}</h3>
                  <TextArea
                    defaultValue={guest.response.dietaryRequirements}
                    error={Boolean(fieldErrors(dietaryName)?.length)}
                    errorMessageId={`${dietaryName}-error`}
                    id={dietaryName}
                    label="Dietary requirements"
                    maxLength={RSVP_FIELD_LIMITS.dietaryRequirements}
                    name={dietaryName}
                    placeholder="Allergies or preferences"
                  />
                  <FieldError
                    id={`${dietaryName}-error`}
                    messages={fieldErrors(dietaryName)}
                  />
                  <TextArea
                    defaultValue={guest.response.accessibilityRequirements}
                    error={Boolean(fieldErrors(accessibilityName)?.length)}
                    errorMessageId={`${accessibilityName}-error`}
                    id={accessibilityName}
                    label="Accessibility requirements"
                    maxLength={RSVP_FIELD_LIMITS.accessibilityRequirements}
                    name={accessibilityName}
                    placeholder="Tell us how we can help"
                  />
                  <FieldError
                    id={`${accessibilityName}-error`}
                    messages={fieldErrors(accessibilityName)}
                  />
                </InformationCard>
              );
            })}

          <div className={styles.twoColumns}>
            <div>
              <TextInput
                defaultValue={household.contactEmail}
                error={Boolean(fieldErrors("contactEmail")?.length)}
                errorMessageId="contactEmail-error"
                id="contactEmail"
                label="Contact email"
                maxLength={254}
                name="contactEmail"
                type="email"
              />
              <FieldError
                id="contactEmail-error"
                messages={fieldErrors("contactEmail")}
              />
            </div>
            <div>
              <TextInput
                defaultValue={household.contactPhone}
                error={Boolean(fieldErrors("contactPhone")?.length)}
                errorMessageId="contactPhone-error"
                id="contactPhone"
                label="Contact phone"
                maxLength={RSVP_FIELD_LIMITS.phone}
                name="contactPhone"
                type="tel"
              />
              <FieldError
                id="contactPhone-error"
                messages={fieldErrors("contactPhone")}
              />
            </div>
          </div>
          <div>
            <TextInput
              defaultValue={household.songRequest}
              error={Boolean(fieldErrors("songRequest")?.length)}
              errorMessageId="songRequest-error"
              id="songRequest"
              label="Song request"
              maxLength={RSVP_FIELD_LIMITS.songRequest}
              name="songRequest"
              placeholder="Song title and artist"
            />
            <FieldError
              id="songRequest-error"
              messages={fieldErrors("songRequest")}
            />
          </div>
          <div>
            <TextArea
              defaultValue={household.message}
              error={Boolean(fieldErrors("message")?.length)}
              errorMessageId="message-error"
              id="message"
              label="Message for Hannah and Isaac"
              maxLength={RSVP_FIELD_LIMITS.message}
              name="message"
              placeholder="Optional note"
            />
            <FieldError id="message-error" messages={fieldErrors("message")} />
          </div>
        </div>
        <div className={styles.actions}>
          <Button onClick={() => goToStep(1)} type="button" variant="secondary">
            Back
          </Button>
          <Button disabled={pending} type="submit">
            {pending ? "Saving…" : "Save RSVP"}
          </Button>
        </div>
      </section>
    </form>
  );
}
