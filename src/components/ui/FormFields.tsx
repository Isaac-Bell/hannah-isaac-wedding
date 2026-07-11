import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import styles from "./ui.module.css";

type Base = { label: string; error?: boolean; helper?: string };
export function TextInput({
  label,
  error,
  helper,
  errorMessageId,
  id,
  className = "",
  ...props
}: Base & { errorMessageId?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const helperId = helper && id ? `${id}-help` : undefined;
  const describedBy =
    [helperId, error ? errorMessageId : undefined].filter(Boolean).join(" ") ||
    undefined;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={describedBy}
        aria-invalid={error || undefined}
        className={`${styles.input} ${error ? styles.invalid : ""} ${className}`}
        id={id}
        {...props}
      />
      {helper && (
        <p className={styles.helper} id={helperId}>
          {helper}
        </p>
      )}
    </div>
  );
}
export function TextArea({
  label,
  error,
  helper,
  id,
  className = "",
  ...props
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const helperId = helper && id ? `${id}-help` : undefined;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <textarea
        aria-describedby={helperId}
        aria-invalid={error || undefined}
        className={`${styles.textarea} ${error ? styles.invalid : ""} ${className}`}
        id={id}
        {...props}
      />
      {helper && (
        <p className={styles.helper} id={helperId}>
          {helper}
        </p>
      )}
    </div>
  );
}
