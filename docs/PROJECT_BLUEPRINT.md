# Project Blueprint

## Product statement

Build a warm, elegant wedding website for Hannah and Isaac. Guests can view general wedding information, enter a private invitation code, RSVP for each named member of their household, and access private details and gifting options.

The design must be original. The supplied reference file is a capture of The Knot editor interface, not a reusable standalone wedding template. Do not copy The Knot branding, proprietary components, JavaScript, SVG marks, class names, or production CSS.

## Provisional event detail

The supplied reference contains a preview route ending in `2026-09-12`. Treat September 12, 2026 as provisional until confirmed in project content.

## MVP pages

### `/`

Public landing page:

- Couple names
- Provisional wedding date
- Hero image placeholder
- Short welcome
- Countdown
- Invitation-code call to action
- General FAQ teaser
- Footer

### `/invite`

Invitation-code entry form.

### `/invite/[code]`

Server-side invitation lookup and guest-party welcome.

### `/rsvp/[code]`

Household RSVP form:

- Attending status per named guest
- Dietary requirements
- Accessibility requirements
- Contact email and phone
- Message to the couple
- Song request
- Optional event attendance
- Edit existing response

### `/details/[code]`

Private venue, schedule, travel, accommodation, dress-code, and parking information.

### `/gifts/[code]`

Private gift page:

- Zelle details or QR placeholder
- PayPal link placeholder
- Optional hosted card checkout placeholder
- No card or bank credentials stored locally

### `/admin`

Private dashboard:

- Invited
- Attending
- Declined
- Awaiting
- Dietary and accessibility summaries
- Invitation management
- CSV export
- Gift-payment metadata

## Security principles

- Generate invitation codes with cryptographically secure randomness.
- Store only a hash of each invitation code.
- Never expose private venue details on the public route.
- Rate-limit invitation-code attempts.
- Validate all form input on the server.
- Use secure, HTTP-only cookies for an invitation session.
- Protect admin separately.
- Never process or store raw payment-card data.
- Verify payment webhooks before recording payment success.
- Do not commit secrets.
- Add `noindex` metadata.
- Keep wedding services isolated from NeonTrade.

## Suggested project structure

```text
src/
  app/
    page.tsx
    invite/
      page.tsx
      [code]/
        page.tsx
    rsvp/
      [code]/
        page.tsx
    details/
      [code]/
        page.tsx
    gifts/
      [code]/
        page.tsx
    admin/
      page.tsx
    api/
      invitations/
      rsvp/
      payments/
      webhooks/
  components/
    layout/
    wedding/
    invitation/
    rsvp/
    gifts/
    admin/
    ui/
  db/
    client.ts
    schema.ts
    migrations/
  lib/
    auth/
    invitations/
    validation/
    rate-limit/
    payments/
    config/
  styles/
    globals.css
```

## Design direction

Until Hannah and Isaac provide screenshots or a clean visual reference:

- Editorial, warm, calm, and intimate
- Spacious composition
- Soft cream background
- Deep charcoal text
- Muted botanical accent
- Fine borders
- Large serif display headings
- Highly readable sans-serif body text
- Restrained motion
- Strong mobile experience
- No generic wedding-template clutter

All visual values should be implemented as CSS custom properties so the palette and typography can be changed quickly.

## Data model

### `invitations`

- `id`
- `party_name`
- `code_hash`
- `maximum_guests`
- `email`
- `phone`
- `is_active`
- `expires_at`
- `created_at`
- `updated_at`

### `guests`

- `id`
- `invitation_id`
- `first_name`
- `last_name`
- `guest_type`
- `is_optional`
- `created_at`
- `updated_at`

### `party_responses`

- `id`
- `invitation_id`
- `contact_email`
- `contact_phone`
- `message`
- `song_request`
- `submitted_at`
- `updated_at`

### `guest_responses`

- `id`
- `guest_id`
- `attending`
- `dietary_requirements`
- `accessibility_requirements`
- `event_choices`
- `updated_at`

### `gift_payments`

- `id`
- `invitation_id`
- `provider`
- `provider_payment_id`
- `amount_minor`
- `currency`
- `status`
- `guest_name`
- `message`
- `created_at`
- `updated_at`

## Sprint sequence

### Sprint 0: Foundation

- Initialize repository and Next.js app
- Add linting, formatting, environment validation, database setup, Docker development services, CI smoke checks, and documentation
- Create static route placeholders
- Establish design tokens and accessible primitives

### Sprint 1: Site shell

- Implement public homepage and responsive navigation
- Add placeholder content and image slots
- Add countdown component
- Add invitation-code entry UI
- Add polished error and loading states

### Sprint 2: Invitations and RSVP

- Add migrations
- Add secure code generator and hash lookup
- Add invitation session
- Add per-guest RSVP workflow
- Add edit workflow
- Add validation and rate limiting

### Sprint 3: Private details

- Add schedule, venue, accommodation, travel, FAQ, dress code, and calendar download

### Sprint 4: Gifts

- Add Zelle and PayPal options
- Add hosted checkout only after provider eligibility is confirmed
- Add verified webhook handling and idempotency

### Sprint 5: Admin

- Add secure authentication
- Add invitation and response management
- Add reports and CSV export

### Sprint 6: Deployment

- Add production Docker image and Compose file
- Deploy under `/opt/wedding-site`
- Use a dedicated database and service account
- Add Cloudflare Tunnel
- Add backups, health checks, logging, and rollback instructions

## MVP acceptance criteria

- Works from 360 px mobile width through large desktop
- Invitation codes cannot be enumerated
- One household cannot RSVP above its assigned guest limit
- Existing responses can be updated
- Private information is not rendered in public HTML
- Invalid, expired, and disabled codes have distinct safe responses
- Admin routes are not accessible to guests
- No raw payment details reach the application
- Production deployment does not share secrets or containers with NeonTrade
