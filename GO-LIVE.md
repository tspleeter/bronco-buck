# BuckThatDuck — Go-Live Checklist

_buckthatduck.com · Pleeter LLC · prepared Aug 2, 2026_

Repo audited: `tspleeter/bronco-buck` @ `main`. Most infrastructure is already shipped (Stripe integration, SES, Route 53 domain, inbound/outbound email, legal pages, fulfillment flow, all 11 colors × 4 views × 2 mane colors). The items below are what stands between the current build and safely taking real customer orders.

---

## 1. Critical blockers — must clear before the first real order

- [ ] **Flip Stripe to live mode.** Checkout currently loads a **test** publishable key.
  - Swap `pk_test_51TYB7…` → `pk_live_…` in `src/app/checkout/page.tsx` (line ~22, the `loadStripe(...)` call).
  - Write the matching `sk_live_…` secret to SSM at `/bronco-buck/stripe-secret-key` (SecureString).
  - Both keys must come from the **same** activated Stripe account.
  - _Verify:_ `grep -oE "pk_(test|live)_[A-Za-z0-9]{6}"` on the deployed checkout returns `pk_live_`.

- [ ] **Activate the Stripe account for payouts.** In the Stripe dashboard: complete business profile (Pleeter LLC, EIN, address), add the bank account for payouts, and confirm the account shows "activated / can accept live charges." A live key on an un-activated account still won't settle funds.

- [ ] **Finish Stripe Tax setup — the code is done, the dashboard is not.** Stripe Tax is integrated and deployed **inert**: checkout calls the Tax Calculation API and links the result to the PaymentIntent, but with no tax registration on file the calc returns $0, so every order currently records **Tax $0.00** (now always shown on the `/orders` list + detail pages). No code change or deploy is needed to turn it on — it activates automatically once the account is registered. Complete these in **Stripe Dashboard → Tax → Settings**:
  - [ ] Set the **origin / ship-from address** (head office) to **8 Nelke Ct, Hawthorne NJ 07506**.
  - [ ] Set the preset **product tax code** to general tangible goods.
  - [ ] Set the preset **shipping tax code**.
  - [ ] Set **tax behavior = exclusive** (USD).
  - [ ] Add a **tax registration — NJ at minimum.** _This is the gate:_ without a registration for a given jurisdiction, tax there stays $0 even with everything else set.
  - _Verify:_ place one live test order and confirm a **Tax** line shows at checkout and a matching entry lands under **Stripe → Tax → Transactions**. On the pinned API version, Stripe auto-commits the transaction on payment success and auto-reverses on refund — no webhook to wire up.
  - _Not tax advice — confirm your nexus/registration obligations with an accountant. Physical goods shipped from NJ trigger NJ sales tax; economic nexus may require registrations in other states too._

- [ ] **Run one full end-to-end order in LIVE mode.** With live keys in place, place a real order start to finish and confirm every hop:
  1. Payment succeeds in Stripe (real charge, live dashboard).
  2. Order row written to `BroncoBuckOrders` in DynamoDB.
  3. Confirmation email arrives from `orders@buckthatduck.com`.
  4. Mark it `shipped` in `/orders/[orderId]` with carrier + tracking.
  5. Shipment email with working "Track your package" link arrives.
  - Refund the test charge afterward.

---

## 2. Verify before launch

- [ ] **Confirm SES is out of the sandbox (production access granted).** If it isn't, emails only send to verified addresses and will silently fail for real customers. Check SES console → Account dashboard → sending status = "Production."

- [ ] **Resolve the sunglasses accessory (G4 V8, +$4).** It's a paid option with no preview image — customers are charged for something they can't see. Either add the render layer or deactivate it the same way Punk mane is (`active:false`).

- [ ] **Sanity-check pricing config.** Base $24.99, shipping $8.95 flat / free ≥ $75. Confirm these are the numbers you want to launch with and that the free-shipping threshold matches your margins on a single-unit order.

- [ ] **Cross-browser + mobile pass.** Load the configurator, cart, and checkout on Safari (desktop + iOS) and Chrome. Confirm previews render across all 4 views, the commercial modal opens, and the Payment Element is usable on a phone.

- [ ] **Order-admin access is locked down.** Confirm `/orders` and `/orders/[orderId]` reject requests without the `orders_auth` cookie, and that the login password is strong (this gate is the only thing protecting customer PII and fulfillment).

---

## 3. Launch day

- [ ] Deploy the live-Stripe commit to `main`; confirm Amplify build succeeds and `buckthatduck.com` serves it.
- [ ] Place the live end-to-end test order (section 1) against the production domain, not a preview URL.
- [ ] Confirm the custom domain, HTTPS cert, and the `%uckThatDuck` wordmark all render correctly on the live domain.
- [ ] Have a rollback plan: know the previous good commit SHA so you can revert if the live checkout misbehaves.

---

## 4. Fast-follow (safe to launch without, do soon after)

- [ ] Add basic analytics / error monitoring (order funnel + checkout failures).
- [ ] OG / social meta tags + favicon check for shared links (`/share/[id]`).
- [ ] Punk mane (G2 V5) relaunch once the 88 punk renders land.
- [ ] Stand-style (G5) preview imagery — currently hidden, so no broken UX, but blocks itemizing it.
- [ ] Admin delete endpoint for shared builds (currently needs AWS console).
- [ ] Nail down fulfillment capacity for the first batch (PrintLabNJ / Bambu PETG HF run).

---

### Non-blocking notes from the audit
- `eslint-config-next` is pinned at `15.2.4` while `next` is `^16.2.2` — minor mismatch, lint works, not a launch blocker.
- Never run `npm audit fix --force` (downgrades Next to v9).
- Stripe key mode is greppable: `pk_(test|live)_[A-Za-z0-9]{6}` — use it as a pre-deploy guard.
