import styles from "./ui.module.css";
export function AttendanceControl({
  legend,
  name,
  defaultValue,
}: {
  legend: string;
  name: string;
  defaultValue?: "yes" | "no";
}) {
  return (
    <fieldset className={styles.segmented}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        <label className={styles.option}>
          <input
            defaultChecked={defaultValue === "yes"}
            name={name}
            type="radio"
            value="yes"
          />
          <span>Attending</span>
        </label>
        <label className={styles.option}>
          <input
            defaultChecked={defaultValue === "no"}
            name={name}
            type="radio"
            value="no"
          />
          <span>Regretfully no</span>
        </label>
      </div>
    </fieldset>
  );
}
