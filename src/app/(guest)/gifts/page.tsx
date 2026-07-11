import { GiftOptions } from "@/components/gifts/GiftOptions";
import { getGiftEnvironment } from "@/lib/config/env";

export default function GiftsPage() {
  const configuration = getGiftEnvironment();
  return (
    <main className="private-page container">
      <p className="eyebrow">Completely optional</p>
      <h1>Gifts</h1>
      <p className="lede">
        Your presence is the greatest gift. For anyone who has asked, we have
        included a few optional ways to contribute toward our next chapter
        together.
      </p>
      <p>
        No gift is expected. Any configured option below opens or uses an
        external personal-payment service.
      </p>
      <GiftOptions configuration={configuration} />
    </main>
  );
}
