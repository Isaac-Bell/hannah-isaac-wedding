import { siteConfig } from "@/lib/config/site";

export default function DetailsPage() {
  return (
    <main className="private-page container">
      <p className="eyebrow">Private details</p>
      <h1>The celebration</h1>
      <p className="lede">
        {siteConfig.weddingDateDisplay} · {siteConfig.weddingLocation}
      </p>
      <p className="quiet-status">{siteConfig.dateStatus}</p>
      <section>
        <h2>Venue and schedule</h2>
        <p>
          Private venue, arrival, and schedule information will appear here once
          confirmed.
        </p>
      </section>
    </main>
  );
}
