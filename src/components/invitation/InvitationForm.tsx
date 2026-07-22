"use client";

import { useActionState, useState } from "react";
import {
  submitInvitationCode,
  type InvitationActionState,
} from "@/app/invite/actions";
import { Button } from "@/components/ui/Button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { TextInput } from "@/components/ui/FormFields";
import { normalizeInvitationCode } from "@/lib/invitations/code";
import styles from "./invitation.module.css";

const initialState: InvitationActionState = { error: null };

export function InvitationForm() {
  const [state, action, pending] = useActionState(
    submitInvitationCode,
    initialState,
  );
  const [code, setCode] = useState("");
  return (
    <form action={action} className={styles.form} noValidate>
      <TextInput
        autoComplete="off"
        className={styles.input}
        error={Boolean(state.error)}
        errorMessageId="invitation-error"
        helper="Use the eight letters and numbers printed on your invitation, for example H6KM-9Q2P."
        id="invitation-code"
        inputMode="text"
        label="Invitation code"
        maxLength={9}
        name="code"
        onChange={(event) =>
          setCode(normalizeInvitationCode(event.target.value))
        }
        placeholder="H6KM-9Q2P"
        required
        value={code}
      />
      {state.error && (
        <FeedbackMessage id="invitation-error">{state.error}</FeedbackMessage>
      )}
      <Button disabled={pending} fullWidth type="submit">
        {pending ? "Checking…" : "Continue"}
      </Button>
    </form>
  );
}
