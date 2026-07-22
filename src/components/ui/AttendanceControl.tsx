import styles from "./ui.module.css";
export function AttendanceControl({
  legend,
  name,
  defaultValue,
  value,
  onChange,
  error,
  errorMessageId,
}: {
  legend: string;
  name: string;
  defaultValue?: "yes" | "no";
  value?: "yes" | "no" | "";
  onChange?: (value: "yes" | "no") => void;
  error?: boolean;
  errorMessageId?: string;
}) {
  return (
    <fieldset
      aria-describedby={error ? errorMessageId : undefined}
      aria-invalid={error || undefined}
      className={styles.segmented}
    >
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        <label className={styles.option}>
          <input
            {...(value === undefined
              ? { defaultChecked: defaultValue === "yes" }
              : { checked: value === "yes" })}
            name={name}
            onChange={() => onChange?.("yes")}
            type="radio"
            value="yes"
          />
          <span>Attending</span>
        </label>
        <label className={styles.option}>
          <input
            {...(value === undefined
              ? { defaultChecked: defaultValue === "no" }
              : { checked: value === "no" })}
            name={name}
            onChange={() => onChange?.("no")}
            type="radio"
            value="no"
          />
          <span>Regretfully no</span>
        </label>
      </div>
    </fieldset>
  );
}
