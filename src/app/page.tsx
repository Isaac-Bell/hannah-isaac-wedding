import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">We’re getting married</p>
        <h1 className="display">Hannah &amp; Isaac</h1>
        {/* Provisional date until confirmed by Hannah and Isaac. */}
        <p className="lede">September 12, 2026</p>
        <p className="lede">
          Welcome. We’re creating a quiet, private place to share the details of
          our celebration with the people we love.
        </p>
        <Link className="button" href="/invite">
          Enter your invitation
        </Link>
      </div>
    </main>
  );
}
