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
  const [error, setError] = useState(false);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(!isInvitationCodeValid(code));
  }
  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <TextInput
        autoComplete="off"
        className={styles.input}
        error={error}
        errorMessageId="invitation-error"
        helper="Use the eight letters and numbers printed on your invitation, for example H6KM-9Q2P."
        id="invitation-code"
        inputMode="text"
        label="Invitation code"
        maxLength={9}
        onChange={(event) => {
          setCode(normalizeInvitationCode(event.target.value));
          setError(false);
        }}
        placeholder="H6KM-9Q2P"
        value={code}
      />
      {error && (
        <FeedbackMessage id="invitation-error">
          {INVITATION_CODE_ERROR}
        </FeedbackMessage>
      )}
      <Button fullWidth type="submit">
        Continue
      </Button>
    </form>
  );
}
