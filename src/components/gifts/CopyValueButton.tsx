"use client";

import { useState } from "react";
import styles from "./gifts.module.css";

export function CopyValueButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
  }
  return (
    <button className={styles.copy} onClick={copy} type="button">
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
