"use client";
import { useState } from "react";
import { AttendanceControl } from "@/components/ui/AttendanceControl";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { TextArea, TextInput } from "@/components/ui/FormFields";
import { InformationCard } from "@/components/ui/InformationCard";
import { RSVPProgress } from "@/components/ui/RSVPProgress";
import styles from "./rsvp.module.css";

export const mockGuests = [
  { id: "guest-one", name: "Guest One" },
  { id: "guest-two", name: "Guest Two" },
] as const;

export function RSVPPreview() {
  const [step, setStep] = useState(1);
  const [demonstrated, setDemonstrated] = useState(false);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    setDemonstrated(true);
  }
  return (
    <form className={styles.form} onSubmit={submit}>
      <RSVPProgress step={step} total={2} />
      {step === 1 ? (
        <>
          <div className={styles.guestGrid}>
            {mockGuests.map((guest) => (
              <InformationCard className={styles.guestCard} key={guest.id}>
                <AttendanceControl
                  defaultValue={guest.id === "guest-one" ? "yes" : undefined}
                  legend={guest.name}
                  name={`attendance-${guest.id}`}
                />
                {guest.id === "guest-one" && (
                  <div className={styles.event}>
                    <label>
                      <input name={`welcome-${guest.id}`} type="checkbox" />
                      <span>
                        <strong>Optional welcome gathering</strong>
                        <span>Timing and location to be confirmed.</span>
                      </span>
                    </label>
                  </div>
                )}
              </InformationCard>
            ))}
          </div>
          <Button fullWidth onClick={() => setStep(2)} type="button">
            Continue to details
          </Button>
        </>
      ) : (
        <>
          <div className={styles.fields}>
            <TextArea
              id="dietary-one"
              label="Dietary requirements for Guest One"
              placeholder="Allergies or preferences"
            />
            <TextArea
              id="accessibility"
              label="Accessibility requirements"
              placeholder="Tell us how we can help"
            />
            <div className={styles.twoColumns}>
              <TextInput
                id="contact-email"
                label="Contact email"
                type="email"
              />
              <TextInput id="contact-phone" label="Contact phone" type="tel" />
            </div>
            <TextInput
              id="song-request"
              label="Song request"
              placeholder="Song title and artist"
            />
            <TextArea
              id="message"
              label="Message for Hannah and Isaac"
              placeholder="Optional note"
            />
          </div>
          {demonstrated && (
            <FeedbackMessage tone="success">
              Preview complete. No response was saved.
            </FeedbackMessage>
          )}
          <div className={styles.actions}>
            <Button
              onClick={() => setStep(1)}
              type="button"
              variant="secondary"
            >
              Back
            </Button>
            <Button type="submit">Review and submit</Button>
          </div>
          <p className={styles.note}>
            Demonstration only — this preview does not save or send RSVP
            responses.
          </p>
        </>
      )}
    </form>
  );
}
