# BuckThatDuck — Project Context (buckthatduck.com)

## Business
- Company: **Pleeter LLC**
- Product: Custom 3D-printed horse figurines ("Buck") based on Ford Bronco color themes
- Repo: `tspleeter/bronco-buck` | Local: `/Users/home/bronco-buck/`
- Hosting: AWS Amplify (auto-deploy on push to `main`)
- Amplify URL: `main.d2s7zk4p5fxxak.amplifyapp.com`

## Stack
- **Frontend:** Next.js
- **Database:** DynamoDB (`BroncoBuckBuilds`, `BroncoBuckOrders`)
- **Payments:** Stripe (secret key in SSM at `/bronco-buck/stripe-secret-key`; publishable key hardcoded due to `NEXT_PUBLIC_` SSR build limitations)
- **Email:** AWS SES sending from `orders@buckthatduck.com`
- **DNS:** Route 53 (hosted zone `Z01222682JOH1P1Z7BZ0R`)
- **Auth/IAM:** Compute role `bronco-buck-compute-role` assigned in Amplify App Settings → IAM roles (required for SSR Lambda env var access)

## Current Status (as of June 2026)
- Stripe payment integration ✅
- SES order confirmation emails ✅
- Route 53 custom domain live ✅
- `/policies` page (Returns, Shipping, FAQ) ✅
- `/policies/privacy` — Privacy Policy page (Pleeter LLC, 8 Nelke Ct, Hawthorne NJ 07506; Stripe carve-out for card data; AWS named as host; CCPA/GDPR/NJ + multi-state rights). Markdown source copy in `docs/privacy-policy.md`. Footer "Privacy" link added in `layout.tsx` ✅
- Sitewide footer with Pleeter LLC copyright and "🇺🇸 Proudly made in the USA" ✅
- Dark theme UI with gold accents (Andrew's redesign) ✅
- `/orders` route is password-gated ✅
- Multi-view builder (front/right/back/left) ✅
- Gallery: 11 color grid, fixed mane defaults per color, links to builder with pre-selected color+mane ✅
- Home page: two-column hero — text left, Buck+duck photo right (anchored top-left) ✅
- Hero image: `public/assets/hero-buck-duck.png` (Buck biting rubber duck, black bg removed) ✅
- Free rubber duck SVG icon included with every order — shown in build summary, cart, confirmation email ✅
- Nameplate overlay on front view only ✅
- `/policies/terms` — Terms of Service page (Pleeter LLC; Ford non-affiliation disclaimer; NJ governing law — **confirm state of registration**; references /policies for returns/shipping; markdown source in `docs/terms-of-service.md`). Footer "Terms" link added in `layout.tsx` ✅
- `src/middleware.ts` → `src/proxy.ts` migration (Next 16; exported `proxy` function, stray `"use server"` removed) ✅
- `npm run lint` fixed — `next lint` (removed in Next 16) replaced with `eslint .` + `eslint.config.mjs` flat config (FlatCompat extending next/core-web-vitals + next/typescript); `@eslint/eslintrc` added to devDependencies ✅
- `/orders-login` Enter button fixed — `ActionButton` defaults to `type="button"`; added `type="submit"` (button was a dead click since the page shipped; keyboard Enter had been masking it) ✅
- Inbound email LIVE: `orders@buckthatduck.com` now forwards to Todd's inbox via forwardemail.net (free, DNS-only — MX `mx1/mx2.forwardemail.net` + apex TXT `forward-email=orders:...` in Route 53). Also added SPF (`v=spf1 include:amazonses.com -all`) and DMARC (`p=none`) for SES deliverability. **MX-records outstanding issue: RESOLVED** ✅
- Governing law: Pleeter LLC registration **confirmed New Jersey** — ToS clause is correct as-is ✅
- Order fulfillment flow LIVE (July 2026): admin `/orders/[orderId]` has a Fulfillment section (status dropdown + carrier + tracking-number inputs + Save). `PATCH /api/orders/[orderId]` (guarded by the same `orders_auth` cookie as the /orders pages) writes status/tracking via `updateOrderFulfillment()` (orders-db, `ReturnValues: ALL_NEW`) and fires `sendShipmentEmail()` **only on the transition into `shipped`** (editing tracking on an already-shipped order won't re-notify). Shipment email matches the dark/gold confirmation style with a "Track your package" button. Carrier tracking URLs (USPS/UPS/FedEx/DHL) built in `src/lib/shipping.ts`. `Order` type gained optional `carrier`/`trackingNumber`/`trackingUrl`/`shippedAt`. Shipping COST was already done at checkout ($8.95 flat, free ≥ $75) ✅
- "See commercial" CTA: gold pill in the **top nav**, between the `%uckThatDuck` wordmark and the Build link (`SeeCommercialButton.tsx`, rendered inline in `SiteNav.tsx`; nav is flex space-between with 3 children so it centers in the gap). Opens a modal video player (`buck-commercial.mp4`). Collapses to icon-only under 560px. `.see-commercial-btn` in globals.css. (Iterated July 2026 through nav-center → hero-top → global-floating before landing here.) ✅

## Configurator — bronco-config.json
- **Product:** Bronco Buck Classic (BB001), base price $24.99
- **Base layer:** `base_bronco.png` (transparent)

### Option Groups
| ID | Group | Options |
|----|-------|---------|
| G1 | Body Color | V1 Ruby Red, V2 Velocity Blue, V3 Shadow Black, V15 Eruption Green, V16 Oxford White, V17 Cyber Orange, V18 Carbonized Gray, V19 Cactus Gray, V20 Desert Sand, V21 Azure Gray, V23 Robin's Egg Blue |
| G2 | Mane Style | V4 Regular (+$0), V5 Punk (+$3, **deactivated** July 2026 pending punk renders), V28 Long (+$3, **LIVE July 2026 for 6 colors: Ruby Red, Oxford White, Desert Sand, Velocity Blue, Shadow Black, Carbonized Gray** — active:true, gated per-color via `LONG_SUPPORTED_G1`; the other 5 colors hide the option until their sets land) |
| G3 | Mane Color | V6 Black (+$0), V7 White (+$2) — now shown in cart summary (imagery is baked into body renders) |
| G4 | Accessories | V8 Sunglasses (+$4) |
| G5 | Stand Style | V9 Standard (+$0) — **hidden from cart summary until imagery ready** |
| G6 | Stand Color | V26 Match Body (+$0, default, first), V27 Black (+$3), V24 Brown (+$3), V25 Sand (+$3) — all live with overlay renders (July 2026); V10/V11 retired but kept in config so old saved builds price correctly |
| G7 | Nameplate | V22 Buck (+$0, default, pre-selected), V12 None, V13 Custom (+$5) |
| G8 | Packaging | V14 Standard Box (+$0) |

### Nameplate
- V22 "Buck" is the default — pre-selected on every new build, free, shows "BUCK" on the preview
- Custom nameplate (V13) is capped at 12 characters
- Nameplate overlay renders on **front view only**
- Overlay zone: top 76.5%, left 10.5%, width 78.8%, height 21.1% of preview container
- Black background, 3px white border all around
- SVG text: viewBox 200×80, fontSize 68, fontWeight 600, white fill, letterSpacing 4
- Hidden groups (G5 only) excluded from `getBuildSummary()` in `src/lib/summary.ts` (G2 + G3 + G6 unhidden July 2026 — paid selections must be itemized)
- **Defaults gotcha:** `getDefaultBuildState()` selects the FIRST active option in each group — the config `default` field is not read. Order options accordingly.
- G2 V5 "Punk" is a real product style (+$3) but **deactivated** until punk renders land (88 images: 11 colors × 4 views × 2 mane colors, `body_{color}_{view}_punkmane_{mane_color}.png`); to relaunch: flip active:true and update MANE_STYLE_MAP V5→"punk". V4 renamed "Short"→"Regular" July 2026.
- G2 V28 "Long" is a real product style (+$3), **LIVE (July 2026) for 6 colors: Ruby Red (V1), Oxford White (V16), Desert Sand (V20), Velocity Blue (V2), Shadow Black (V3), Carbonized Gray (V18)** — all with complete, head-aligned 8/8 render sets. **Per-color gating** is the mechanism (so unsupported colors never 404): (a) `mane.ts` `MANE_STYLE_MAP` V28→"long"; (b) `mane.ts` exports `LONG_SUPPORTED_G1` (the 6 ids above), and `getManeContext` reads G1 and falls back style→"reg" if Long is selected on an unsupported color (protects builder/cart/saved/share previews); (c) `OptionGroup.tsx` has a `hiddenOptionIds` prop; (d) `build/[productSlug]/page.tsx` passes `hiddenOptionIds=["V28"]` to G2 when the selected color isn't in `LONG_SUPPORTED_G1`, and its onChange resets G2→V4 if the user switches to an unsupported color while Long is selected. **To add another color to Long:** finish its 8 head-aligned renders, then add its G1 id to `LONG_SUPPORTED_G1`. **Render progress (62 of 88):** the 6 live colors complete (8 each); Cactus Gray — black complete + white 3/4 (**missing white left**); Azure Gray — white complete + black 3/4 (**missing black front** = un-uploaded `Untitled_65`); Eruption Green / Cyber Orange / Robin's Egg Blue — none yet. All head-aligned to regmane (white manes can't use teeth alignment → plinth-aligned, consistent with their same-camera black manes; verified via muzzle silhouette on near-black bodies). **Still needed to expand Long:** Cactus white *left* (1); Azure black *front* (1); Eruption Green, Cyber Orange, Robin's Egg Blue (24). Full set = 88 (11 colors × 4 views × 2 mane colors).
- **Provisional-slug colors (July 2026) — pushed, NOT yet wired to G1:** three Long-render bodies matched none of the 11 configured colors and had no regmane set, but were pushed under **descriptive provisional slugs** (per Todd "add all the good files now") so the work is preserved; they are inert (not in G1, Long deactivated) and **easily renamed**. They are PLINTH-aligned only (no regmane to head-match against; fronts are head-correct, sides are plinth-anchored until each color's regmane arrives): (1) **`brown`** RGB≈(89,54,35) — complete 8; (2) **`tan`** RGB≈(193,165,128), NOT Desert Sand (33 off) — 6 (black complete, white front+left); (3) **`sky_blue`** RGB≈(108,179,211), NOT Robin's Egg (66 off)/Velocity — 6 (white complete, black front+back). **To make any of these live, Todd must supply:** real Ford name/code + final G1 slug (rename files if needed) + G1 id (next free V29) + the full **Regular-mane** render set for that color. The earlier **charcoal/dark-gray** held set (`Untitled_9..12`) was resolved as **Carbonized Gray** (config color; near-black, ambiguous vs Shadow Black by color but logically carbonized since Shadow was a separate batch) and pushed as such (black mane; `right` view is plinth-aligned only — near-black body defeats teeth+skin head landmarks). Identify uploaded colors by sampling **plinth median RGB** vs reference `body_{color}_front_regmane_black.png` (good match <~12 units).

### Gallery defaults (mane color per body color)
- White mane: Ruby Red, Velocity Blue, Shadow Black, Carbonized Gray
- Black mane: Eruption Green, Oxford White, Cyber Orange, Cactus Gray, Desert Sand, Azure Gray, Robin's Egg Blue

## Image Assets — `public/assets/`

### Hero image
- `hero-buck-duck.png` — photo of blue Buck biting a yellow rubber duck, black background removed
- Used in homepage two-column hero, `objectPosition: left top`, `objectFit: contain`

### Commercial video
- `buck-commercial.mp4` — 24s promo spot, H.264/AAC, +faststart, ~1.5 MB (transcoded from a 129 MB ProRes .mov; raw .mov exceeds GitHub's 100 MB limit and isn't browser-playable, so always transcode)
- `buck-commercial-poster.jpg` — poster frame (~2s in)
- Played by `SeeCommercialButton` modal; served from `/assets/` (Next public root)

### Body renders — `public/assets/body/`
- Naming: `body_{color}_{view}_regmane_{mane_color}.png`
- Views in UI: `front`, `back`, `left`, `right` (`side` files exist but not used)
- Mane colors: `black`, `white`
- All 11 colors complete for all 4 views + both mane colors

**Colors:** azure_gray, cactus_gray, carbonized_gray, cyber_orange, desert_sand, eruption_green, oxford_white, robins_egg_blue, ruby_red, shadow_black, velocity_blue

**Robin's Egg Blue (V23):** Heritage Edition color (2023–2025, discontinued 2026 MY), Ford paint code CW/M7478, screen approx #BADBE4, solid non-metallic finish. Added July 2026.

**Legacy/unused files** (safe to ignore): `body_black_*`, `body_blue.png`, `body_red.png`, `body_green.png`, `body_grey_front.png`, `body_cyan_front.png`, `body_yellow_front.png`

### Preview rendering notes (July 2026)
- **Nameplate calibration:** stand flat face (front view) spans y983-1228 on a 990x1294 canvas across all colors. Plate CSS = top 76.5% / height 18.0% (y990-1223). The old 21.1% height overflowed the bottom molding by ~35px. If stand geometry ever changes, re-measure the face band with a row-width profile.
- `getManeContext()` in `src/lib/mane.ts` is the single source for deriving mane style/color from selections; it FALLS BACK to reg/black because body renders only exist mane-baked. Cart, /saved, /saved/[id], and /share/[shareId] all previously omitted the mane prop → body img 404'd → empty preview pictures. All four fixed July 2026 via getManeContext().
- `BuilderPreview` preloads all 4 views of every selected layer via hidden imgs so view switches swap body + stand overlays together from cache.

### Pending image work
- **Stand overlays learnings (July 2026):** side-view screenshots can have slight camera-orbit parallax vs originals (head shifts relative to stand). Alignment must refine on the stand band (y>850) after coarse global alignment. Light stand colors (sand) can fail diff-threshold extraction near highlights — use the black stand's alpha as the canonical stencil for all colors of the same view. Todd's Bambu layout has 4 filament slots, so non-black stand screenshots show recolored eyes — harmless, extraction only keeps the stand region.
- Mane style images: Punk (no renders yet); Long (V28 — **62 of 88 done**, all head-aligned to regmane; **6 colors LIVE**: Ruby Red / Oxford White / Desert Sand / Velocity Blue / Shadow Black / Carbonized Gray complete 8/8; Cactus Gray missing white-left; Azure Gray missing black-front; Eruption Green / Cyber Orange / Robin's Egg Blue untouched; plus 3 provisional-slug colors brown/tan/sky_blue pushed but not G1-wired)
- **Long batch view/mane auto-detection caveats:** view via red-tongue centroid (absent=back, centered=front, offset=profile→facing) — but on a **red body** (Ruby Red) raise the tongue threshold to R>175 to exclude the body; profiles show only a sliver of tongue so use a low back cutoff (~100px). Mane color via **crown brightness** (top 10% of fg: <110=black, >150=white) — do NOT use whole-image dark-fraction (open mouth inflates it) or bright-white teeth detectors (white body/white mane both trip them). Left file = muzzle faces left (verified across 3 batches).
- Stand style/color preview images
- Accessory (sunglasses) layer images

## Image Processing — Bambu Studio Screenshots
- Remove gray background (RGB 84,85,90) via flood fill from borders, tolerance ~10–20 per channel
- **Canvas is 990×1294** (matches preview aspect ratio) — NOT 800×1100 (old, incorrect note; caused a misaligned Robin's Egg Blue batch in July 2026)
- Deployed renders fill the frame edge-to-edge (front/back clip at bottom, left/right clip at sides) — do NOT fit-with-margin
- **Alignment method:** scale + position new renders by mask-matching against an existing color's file for the same view+mane (initial scale from the unclipped bbox dimension: width for front/back, height for left, exact bbox for right; then grid-search offset/scale to maximize silhouette IoU — expect ≥0.97)
- **Head-alignment refinement (Long renders, July 2026 — "line up heads like the other mane"):** plinth-alignment gets scale right and the head within a few px on most views, but **side views have variable camera parallax** vs the regmane (small on most, but up to ~57px on some color/view combos — e.g. Azure/Desert `right`). To match the head to the regmane, keep the plinth scale but **refine translation on a head landmark**, priority: (1) **teeth** = most precise, usable when body is colored/dark AND mane is black (teeth = bright white, mn>200 & low-sat); compute teeth-centroid offset vs regmane, shift by −offset. (2) For a **white mane**, the teeth detector catches the mane → unusable; **borrow the same color+view black-mane shift** (black & white share the render camera — measured shifts match within ~2px). (3) For a **white body** (Oxford), teeth blend into the face → use the red **tongue** centroid (high R, low G/B). (4) Head-**skin** region IoU (body-colored pixels above plinth, mane excluded by color) works for non-white bodies but is only centroid-accurate (±~18px), so treat it as coarse. **GUARDS (critical):** reject any shift >70px (real parallax maxes ~57px) or that does not reduce residual — the skin mask rails on white mane and the teeth detector rails on near-black bodies, giving bogus 78–205px shifts; only apply if it converges (residual <5px), else keep plinth-aligned. Back views have no head landmark → keep plinth-aligned. Near-black bodies (Carbonized) defeat teeth+skin+tongue on some views (e.g. `right`) → leave plinth-aligned. **Tradeoff:** head-priority means the plinth drifts on parallax side-views — harmless while stand overlays are disabled and the nameplate is front-only. `work/master_map.txt` maps all 46 configured-color sources → color/view/mane.
- Compose onto solid gray (84,85,90), save as RGB PNG
- **No recoloring** — background removal and size normalization only
- **Carbonized Gray special case:** its body/stand colors are within 3-8 RGB points of the Bambu background (84,84,90) — color-threshold masking is impossible. Align via internal feature mask (pixels >25 from bg: mane, eyes, teeth, tongue, shadow creases) and paste the whole aligned screenshot rect (bg is already the same gray, no mask needed). Scale the screenshot so it fully covers the 990x1294 canvas to avoid fill seams.

## File Authoring Rules
- **Always write TSX/JSX files to disk first** (`cat > /home/claude/file.tsx << 'ENDOFFILE'`), then push via GitHub Contents API with `open(...,'rb')` for base64 encoding
- Never embed TSX with template literals in Python strings — backticks and `${}` get mangled
- Sleep 0.4–0.5s between sequential GitHub API pushes
- GET SHA before every PUT

## Key Learnings
- **Modals rendered inside `.site-nav` must portal to `document.body`:** the nav has `backdrop-filter: blur(24px)`, which (per spec, and enforced by Safari) makes it the *containing block* for any `position:fixed` descendant. A fixed modal overlay rendered inside the nav gets trapped in the 68px nav strip and pins to the top of the screen. `SeeCommercialButton`'s video modal uses `createPortal(modal, document.body)` to escape it. (Also: center modals with flexbox, not `fixed + translate(-50%,-50%)` — the transform makes Safari mis-place `<video>`.)
- **Amplify SSR Lambda env vars:** Console env vars do NOT reach SSR functions — use IAM compute role + SSM Parameter Store
- **GitHub Contents API push:** GET SHA first → PUT with base64 + SHA; sleep ~0.4s between pushes; token `ghp_*` classic PAT with repo scope
- **Local git auth:** Can be stale — GitHub Contents API is the reliable path
- **Amplify deploy check:** Site returns 403 to external requests — not a failure; check Amplify console
- **Preview aspect ratio:** 990/1294 (≈3/4)
- **CSS font-size % on spans** is relative to inherited font-size, not container height — use SVG text for size-relative nameplate text
- **`cqh` units** require `container-type` to be set on the parent — don't use without it
- **rembg / AI background removal** requires downloading a model (~170MB) from GitHub — blocked by network policy; use GrabCut (OpenCV) or remove.bg instead
- **White subjects on white backgrounds** can't be cleanly separated with flood-fill — use remove.bg or photograph against a dark background

## Approach
- Todd prefers Claude to **execute tasks directly** without asking for confirmation
- Always read CLAUDE.md at session start
- Begin code sessions with full codebase audit before making changes
