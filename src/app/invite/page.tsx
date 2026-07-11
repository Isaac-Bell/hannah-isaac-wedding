import { InvitationForm } from "@/components/invitation/InvitationForm";

export default function InvitePage() {
  return (
    <main className="guest-entry page">
      <div className="guest-panel">
        <p className="eyebrow">Private guest portal</p>
        <h1>Enter your invitation</h1>
        <p className="lede">
          Use the unique code from your invitation to view private wedding
          details.
        </p>
        <InvitationForm />
      </div>
    </main>
  );
}
