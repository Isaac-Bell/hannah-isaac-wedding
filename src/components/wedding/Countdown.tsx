"use client";
import { useEffect, useState } from "react";
import { getCountdown } from "@/lib/countdown";
import styles from "./countdown.module.css";
export function Countdown({
  target,
  variant = "detailed",
}: {
  target: string;
  variant?: "detailed" | "summary";
}) {
  const [value, setValue] = useState(() => getCountdown(new Date(target)));
  useEffect(() => {
    const update = () => setValue(getCountdown(new Date(target)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  if (value.complete)
    return (
      <p className={variant === "summary" ? styles.summary : styles.countdown}>
        Today is the day!
      </p>
    );
  if (variant === "summary") {
    return (
      <p aria-live="polite" className={styles.summary}>
        <span>{value.days}</span> days to go!
      </p>
    );
  }
  return (
    <div
      aria-label="Countdown to the provisional wedding date"
      className={styles.countdown}
    >
      {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
        <div key={unit}>
          <span className={styles.value}>
            {String(value[unit]).padStart(unit === "days" ? 1 : 2, "0")}
          </span>
          <span className={styles.label}>{unit}</span>
        </div>
      ))}
    </div>
  );
}
