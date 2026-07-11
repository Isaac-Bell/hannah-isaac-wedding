"use client";

import { useActionState, useState } from "react";
import {
  submitInvitationCode,
  type InvitationActionState,
} from "@/app/invite/actions";
import { normalizeInvitationCode } from "@/lib/invitations/code";

const initialState: InvitationActionState = { error: null };

export function InvitationForm() {
  const [state, action, pending] = useActionState(
    submitInvitationCode,
    initialState,
  );
  const [code, setCode] = useState("");
  return (
    <form action={action} className="guest-form" noValidate>
      <label htmlFor="invitation-code">Invitation code</label>
      <input
        aria-describedby={state.error ? "invitation-error" : "invitation-help"}
        aria-invalid={state.error ? true : undefined}
        autoComplete="off"
        id="invitation-code"
        maxLength={9}
        name="code"
        onChange={(event) =>
          setCode(normalizeInvitationCode(event.target.value))
        }
        placeholder="H6KM-9Q2P"
        required
        value={code}
      />
      <p className="form-help" id="invitation-help">
        Enter the eight letters and numbers printed on your invitation.
      </p>
      {state.error && (
        <p className="form-error" id="invitation-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="button" disabled={pending} type="submit">
        {pending ? "Checking…" : "Continue"}
      </button>
    </form>
  );
}
