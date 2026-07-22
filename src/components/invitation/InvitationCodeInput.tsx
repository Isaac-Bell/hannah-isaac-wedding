"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { TextInput } from "@/components/ui/FormFields";
import {
  INVITATION_CODE_ERROR,
  isInvitationCodeValid,
  normalizeInvitationCode,
} from "@/lib/invitations/code";
import styles from "./invitation.module.css";
export function InvitationCodeInput() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"error" | "valid" | null>(null);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(isInvitationCodeValid(code) ? "valid" : "error");
  }
  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <TextInput
        autoComplete="off"
        className={styles.input}
        error={status === "error"}
        errorMessageId="invitation-error"
        helper="Use the eight letters and numbers printed on your invitation, for example H6KM-9Q2P."
        id="invitation-code"
        inputMode="text"
        label="Invitation code"
        maxLength={9}
        onChange={(event) => {
          setCode(normalizeInvitationCode(event.target.value));
          setStatus(null);
        }}
        placeholder="H6KM-9Q2P"
        value={code}
      />
      {status === "error" && (
        <FeedbackMessage id="invitation-error">
          {INVITATION_CODE_ERROR}
        </FeedbackMessage>
      )}
      {status === "valid" && (
        <FeedbackMessage tone="success">
          This code format is valid. Secure invitation lookup will be connected
          in the next sprint.
        </FeedbackMessage>
      )}
      <Button fullWidth type="submit">
        Continue
      </Button>
    </form>
  );
}
