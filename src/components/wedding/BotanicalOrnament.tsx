import styles from "./botanical-ornament.module.css";

export function BotanicalOrnament({ side }: { side: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className={`${styles.ornament} ${styles[side]}`}
      fill="none"
      viewBox="0 0 220 300"
    >
      <path d="M14 290C45 243 50 192 80 148C105 111 151 91 184 34" />
      <path d="M55 200C29 191 20 174 18 154C40 157 59 169 67 188" />
      <path d="M82 148C65 127 64 106 71 88C91 100 104 119 99 139" />
      <path d="M112 119C119 91 137 76 158 70C156 94 144 113 122 125" />
      <path d="M145 82C142 58 154 40 171 29C177 50 170 70 155 87" />
      <path d="M40 239C63 221 83 220 101 226C87 245 66 253 45 248" />
      <circle cx="112" cy="119" r="3" />
      <circle cx="148" cy="82" r="2.5" />
    </svg>
  );
}
