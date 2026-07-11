import styles from "./ui.module.css";
export function RSVPProgress({ step, total }: { step: number; total: number }) {
  return (
    <div aria-label={`Step ${step} of ${total}`} className={styles.progress}>
      <span className={styles.progressLabel}>
        Step {step} of {total}
      </span>
      <div aria-hidden="true" className={styles.track}>
        <div
          className={styles.bar}
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
