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

## Configurator — bronco-config.json
- **Product:** Bronco Buck Classic (BB001), base price $24.99
- **Base layer:** `base_bronco.png` (transparent)

### Option Groups
| ID | Group | Options |
|----|-------|---------|
| G1 | Body Color | V1 Ruby Red, V2 Velocity Blue, V3 Shadow Black, V15 Eruption Green, V16 Oxford White, V17 Cyber Orange, V18 Carbonized Gray, V19 Cactus Gray, V20 Desert Sand, V21 Azure Gray |
| G2 | Mane Style | V4 Short (+$0), V5 Punk (+$3) |
| G3 | Mane Color | V6 Black (+$0), V7 White (+$2) |
| G4 | Accessories | V8 Sunglasses (+$4) |
| G5 | Stand Style | V9 Standard (+$0) |
| G6 | Stand Color | V10 Black (+$0), V11 Red (+$1) |
| G7 | Nameplate | V12 None, V22 Buck (+$2), V13 Custom (+$5) |
| G8 | Packaging | V14 Standard Box (+$0) |

## Image Assets — `public/assets/body/`

### Naming Convention
- Body only: `body_{color}_{view}.png`
- With mane: `body_{color}_{view}_regmane_{mane_color}.png`
- Views: `front`, `side`, `back`, `left`, `right`
- Mane colors: `black`, `white`

### Coverage (all 10 colors)
All 10 Ford Bronco colors have the following views complete:
- `front` (body only)
- `front_regmane_black`, `front_regmane_white`
- `side_regmane_black`, `side_regmane_white`
- `back_regmane_black`, `back_regmane_white`
- `left_regmane_black`, `left_regmane_white`
- `right_regmane_black`, `right_regmane_white`

**Colors:** azure_gray, cactus_gray, carbonized_gray, cyber_orange, desert_sand, eruption_green, oxford_white, ruby_red, shadow_black, velocity_blue

**Legacy/unused files** (safe to ignore): `body_black_*`, `body_blue.png`, `body_red.png`, `body_green.png`, `body_grey_front.png`, `body_cyan_front.png`, `body_yellow_front.png`, `body_eruption_green_front-regmane_white.png` (malformed name, duplicate of `_front_regmane_white`)

### Pending image work
- Stand style/color preview images (not yet available from Bambu Studio)
- Accessory (sunglasses) layer images

## Image Processing — Bambu Studio Screenshots
- Remove gray background (RGB 84,85,90) via flood fill from borders, tolerance ~10–20 per channel
- Crop to content with 20px padding
- Normalize to 800×1100 canvas centered at 92% scale
- Save as RGB PNG (no transparency) unless compositing requires it
- **No recoloring** — background removal and size normalization only

## Key Learnings
- **Amplify SSR Lambda env vars:** Console env vars do NOT reach SSR functions — use IAM compute role + SSM Parameter Store
- **GitHub Contents API push:** GET SHA first → PUT with base64 + SHA (omit SHA for new files); sleep ~0.4s between pushes to avoid race conditions; token format `ghp_*` classic PAT with repo scope
- **Local git auth:** Can be stale — GitHub Contents API is reliable fallback, then `git pull` to sync local
- **Amplify deploy check:** Site returns 403 to external requests (Amplify auth) — not a failure; check Amplify console directly
- **Preview aspect ratio:** 3/4 (800×1100 canvas)

## Approach
- Todd prefers Claude to **execute tasks directly** without asking for confirmation
- Git pushes batched via GitHub Contents API when local auth is broken
- Always read CLAUDE.md at session start
- Begin code sessions with full codebase audit before making changes
