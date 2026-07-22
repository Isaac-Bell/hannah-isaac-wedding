import styles from "../guest.module.css";

export default function RsvpPage() {
  return (
    <main className={`container ${styles.page}`}>
      <p className="eyebrow">Your household</p>
      <h1>RSVP</h1>
      <div className={styles.card}>
        <h2>Responses open soon</h2>
        <p>
          Household RSVP persistence is intentionally scheduled for the next
          RSVP implementation sprint. Your invitation session is working, but no
          response is being stored yet.
        </p>
      </div>
    </main>
  );
}
