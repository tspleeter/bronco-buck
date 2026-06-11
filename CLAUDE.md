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
- Sitewide footer with Pleeter LLC copyright and "🇺🇸 Proudly made in the USA" ✅
- Dark theme UI with gold accents (Andrew's redesign) ✅
- `/orders` route is password-gated ✅
- Multi-view builder (front/right/back/left) ✅
- Gallery: 10 color grid, fixed mane defaults per color, links to builder with pre-selected color+mane ✅
- Home page: Community/Recent builds sections removed ✅
- Free rubber duck (SVG icon) included with every order — shown in build summary, cart, and confirmation email ✅

## Configurator — bronco-config.json
- **Product:** Bronco Buck Classic (BB001), base price $24.99
- **Base layer:** `base_bronco.png` (transparent)

### Option Groups
| ID | Group | Options |
|----|-------|---------|
| G1 | Body Color | V1 Ruby Red, V2 Velocity Blue, V3 Shadow Black, V15 Eruption Green, V16 Oxford White, V17 Cyber Orange, V18 Carbonized Gray, V19 Cactus Gray, V20 Desert Sand, V21 Azure Gray |
| G2 | Mane Style | V4 Short (+$0), V5 Punk (+$3) — **hidden from cart summary until imagery ready** |
| G3 | Mane Color | V6 Black (+$0), V7 White (+$2) — **hidden from cart summary until imagery ready** |
| G4 | Accessories | V8 Sunglasses (+$4) |
| G5 | Stand Style | V9 Standard (+$0) — **hidden from cart summary until imagery ready** |
| G6 | Stand Color | V10 Black (+$0), V11 Red (+$1) — **hidden from cart summary until imagery ready** |
| G7 | Nameplate | V22 Buck (+$0, default, pre-selected), V12 None, V13 Custom (+$5) |
| G8 | Packaging | V14 Standard Box (+$0) |

### Nameplate
- V22 "Buck" is the default — pre-selected on every new build, free, shows "BUCK" on the preview
- Custom nameplate (V13) is capped at 12 characters
- Nameplate overlay uses SVG text positioned precisely on the stand's front panel:
  - Zone: top 76.5%, left 10.5%, width 78.8%, height 21.1% of preview container
  - Black background, 3px white border all around
  - SVG text: viewBox 200×100, fontSize 80, fontWeight 600, white fill
- Hidden groups (G2, G3, G5, G6) are excluded from `getBuildSummary()` in `src/lib/summary.ts`

### Gallery defaults (mane color per body color)
- White mane: Ruby Red, Velocity Blue, Shadow Black, Carbonized Gray
- Black mane: Eruption Green, Oxford White, Cyber Orange, Cactus Gray, Desert Sand, Azure Gray

## Image Assets — `public/assets/body/`

### Naming Convention
- Body only: `body_{color}_{view}.png`
- With mane: `body_{color}_{view}_regmane_{mane_color}.png`
- Views: `front`, `back`, `left`, `right` (side exists in files but not used in UI)
- Mane colors: `black`, `white`

### Coverage (all 10 colors)
All 10 Ford Bronco colors have the following views complete:
- `front` (body only)
- `front_regmane_black`, `front_regmane_white`
- `back_regmane_black`, `back_regmane_white`
- `left_regmane_black`, `left_regmane_white`
- `right_regmane_black`, `right_regmane_white`

**Colors:** azure_gray, cactus_gray, carbonized_gray, cyber_orange, desert_sand, eruption_green, oxford_white, ruby_red, shadow_black, velocity_blue

**Legacy/unused files** (safe to ignore): `body_black_*`, `body_blue.png`, `body_red.png`, `body_green.png`, `body_grey_front.png`, `body_cyan_front.png`, `body_yellow_front.png`, `body_eruption_green_front-regmane_white.png`

### Pending image work
- Mane style images (Short vs Punk) — builder UI exists, layers disabled until photos arrive
- Stand style/color preview images
- Accessory (sunglasses) layer images

## Image Processing — Bambu Studio Screenshots
- Remove gray background (RGB 84,85,90) via flood fill from borders, tolerance ~10–20 per channel
- Crop to content with 20px padding
- Normalize to 800×1100 canvas centered at 92% scale
- Save as RGB PNG (no transparency) unless compositing requires it
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
- **`cqh` units** require container query context (`container-type`) to be set — don't use without it

## Approach
- Todd prefers Claude to **execute tasks directly** without asking for confirmation
- Always read CLAUDE.md at session start
- Begin code sessions with full codebase audit before making changes
