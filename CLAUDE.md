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

## Configurator — bronco-config.json
- **Product:** Bronco Buck Classic (BB001), base price $24.99
- **Base layer:** `base_bronco.png` (transparent)

### Option Groups
| ID | Group | Options |
|----|-------|---------|
| G1 | Body Color | V1 Ruby Red, V2 Velocity Blue, V3 Shadow Black, V15 Eruption Green, V16 Oxford White, V17 Cyber Orange, V18 Carbonized Gray, V19 Cactus Gray, V20 Desert Sand, V21 Azure Gray, V23 Robin's Egg Blue |
| G2 | Mane Style | V4 Short (+$0), V5 Punk (+$3) — **hidden from cart summary until imagery ready** |
| G3 | Mane Color | V6 Black (+$0), V7 White (+$2) — now shown in cart summary (imagery is baked into body renders) |
| G4 | Accessories | V8 Sunglasses (+$4) |
| G5 | Stand Style | V9 Standard (+$0) — **hidden from cart summary until imagery ready** |
| G6 | Stand Color | V26 Match Body (+$0, default, first), V27 Black (+$3, inactive until renders), V24 Brown (+$3, inactive), V25 Sand (+$3, inactive); V10/V11 retired but kept in config so old saved builds price correctly |
| G7 | Nameplate | V22 Buck (+$0, default, pre-selected), V12 None, V13 Custom (+$5) |
| G8 | Packaging | V14 Standard Box (+$0) |

### Nameplate
- V22 "Buck" is the default — pre-selected on every new build, free, shows "BUCK" on the preview
- Custom nameplate (V13) is capped at 12 characters
- Nameplate overlay renders on **front view only**
- Overlay zone: top 76.5%, left 10.5%, width 78.8%, height 21.1% of preview container
- Black background, 3px white border all around
- SVG text: viewBox 200×80, fontSize 68, fontWeight 600, white fill, letterSpacing 4
- Hidden groups (G2, G5) excluded from `getBuildSummary()` in `src/lib/summary.ts` (G3 + G6 unhidden July 2026)
- **Defaults gotcha:** `getDefaultBuildState()` selects the FIRST active option in each group — the config `default` field is not read. Order options accordingly.
- **KNOWN ISSUE:** G2 V5 "Punk" mane charges +$3 but renders as regular mane (MANE_STYLE_MAP maps V4 and V5 both to "reg") and is hidden from the summary — a customer can silently pay $3 for nothing. Needs either Punk renders or deactivation.

### Gallery defaults (mane color per body color)
- White mane: Ruby Red, Velocity Blue, Shadow Black, Carbonized Gray
- Black mane: Eruption Green, Oxford White, Cyber Orange, Cactus Gray, Desert Sand, Azure Gray, Robin's Egg Blue

## Image Assets — `public/assets/`

### Hero image
- `hero-buck-duck.png` — photo of blue Buck biting a yellow rubber duck, black background removed
- Used in homepage two-column hero, `objectPosition: left top`, `objectFit: contain`

### Body renders — `public/assets/body/`
- Naming: `body_{color}_{view}_regmane_{mane_color}.png`
- Views in UI: `front`, `back`, `left`, `right` (`side` files exist but not used)
- Mane colors: `black`, `white`
- All 11 colors complete for all 4 views + both mane colors

**Colors:** azure_gray, cactus_gray, carbonized_gray, cyber_orange, desert_sand, eruption_green, oxford_white, robins_egg_blue, ruby_red, shadow_black, velocity_blue

**Robin's Egg Blue (V23):** Heritage Edition color (2023–2025, discontinued 2026 MY), Ford paint code CW/M7478, screen approx #BADBE4, solid non-metallic finish. Added July 2026.

**Legacy/unused files** (safe to ignore): `body_black_*`, `body_blue.png`, `body_red.png`, `body_green.png`, `body_grey_front.png`, `body_cyan_front.png`, `body_yellow_front.png`

### Pending image work
- **Stand colors (V27 Black / V24 Brown / V25 Sand):** need 12 Bambu screenshots — the 4 standard views × 3 stand colors, rendered with any ONE existing body color (Robin's Egg Blue or Azure Gray recommended) and the SAME camera framing as body renders. Stand overlays get extracted by diffing against the matching existing body render, saved as `public/assets/stand-color/stand_{color}_{view}.png` (transparent PNG, 990×1294). Then flip V27/V24/V25 active:true.
- Mane style images (Short vs Punk) — builder UI exists, layers disabled until photos arrive
- Stand style/color preview images
- Accessory (sunglasses) layer images

## Image Processing — Bambu Studio Screenshots
- Remove gray background (RGB 84,85,90) via flood fill from borders, tolerance ~10–20 per channel
- **Canvas is 990×1294** (matches preview aspect ratio) — NOT 800×1100 (old, incorrect note; caused a misaligned Robin's Egg Blue batch in July 2026)
- Deployed renders fill the frame edge-to-edge (front/back clip at bottom, left/right clip at sides) — do NOT fit-with-margin
- **Alignment method:** scale + position new renders by mask-matching against an existing color's file for the same view+mane (initial scale from the unclipped bbox dimension: width for front/back, height for left, exact bbox for right; then grid-search offset/scale to maximize silhouette IoU — expect ≥0.97)
- Compose onto solid gray (84,85,90), save as RGB PNG
- **No recoloring** — background removal and size normalization only

## File Authoring Rules
- **Always write TSX/JSX files to disk first** (`cat > /home/claude/file.tsx << 'ENDOFFILE'`), then push via GitHub Contents API with `open(...,'rb')` for base64 encoding
- Never embed TSX with template literals in Python strings — backticks and `${}` get mangled
- Sleep 0.4–0.5s between sequential GitHub API pushes
- GET SHA before every PUT

## Key Learnings
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
