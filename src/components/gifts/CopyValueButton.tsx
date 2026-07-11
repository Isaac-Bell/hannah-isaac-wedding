"use client";

import { useState } from "react";

export function CopyValueButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
  }
  return (
    <button className="text-button" onClick={copy} type="button">
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
