# BuckThatDuck — Project Context for Claude

## Project Overview
- **Site**: BuckThatDuck — custom Ford Bronco-themed 3D-printed horse figurine configurator
- **Live URL**: https://www.buckthatduck.com
- **Amplify URL**: https://main.d2s7zk4p5fxxak.amplifyapp.com
- **GitHub**: https://github.com/tspleeter/bronco-buck (private)
- **Company**: Pleeter LLC
- **Owner**: Todd Pleeter (toddpleeter@outlook.com)
- **Son Andrew** (andrewpleeter@gmail.com) contributed UI redesign and image set

## Full Stack
- **Frontend**: Next.js (App Router), TypeScript
- **Backend**: AWS Amplify (auto-deploys from GitHub main)
- **Database**: DynamoDB — BroncoBuckBuilds, BroncoBuckOrders tables
- **Payments**: Stripe (secret key in SSM at /bronco-buck/stripe-secret-key)
- **Email**: AWS SES from orders@buckthatduck.com
- **DNS**: Route 53 (hosted zone Z01222682JOH1P1Z7BZ0R)
- **IAM**: Compute role bronco-buck-compute-role assigned in Amplify

## Key Learnings
- Amplify SSR env vars don't reach Lambda — use SSM Parameter Store + compute role
- Stripe publishable key hardcoded in src/app/checkout/page.tsx
- Stripe secret key fetched from SSM at runtime
- Amplify deploys on every push to main

## Image Architecture
Images live in public/assets/body/
Naming: body_{color_name}_{view}_regmane_{mane_color}.png
- Views: front, back, left, right, side
- Mane colors: black, white
- Also plain body_{color_name}_{view}.png (no mane variant)

## 10 Ford Body Colors
| Option ID | Color Name | Image Layer |
|---|---|---|
| V1 | Ruby Red | body_ruby_red |
| V2 | Velocity Blue | body_velocity_blue |
| V3 | Shadow Black | body_shadow_black |
| V15 | Eruption Green | body_eruption_green |
| V16 | Oxford White | body_oxford_white |
| V17 | Cyber Orange | body_cyber_orange |
| V18 | Carbonized Gray | body_carbonized_gray |
| V19 | Cactus Gray | body_cactus_gray |
| V20 | Desert Sand | body_desert_sand |
| V21 | Azure Gray | body_azure_gray |

## Ford Color Hex Codes (for Bambu Studio)
- Shadow Black: #1C1C1E
- Oxford White: #F2F0EB
- Velocity Blue: #1A4FAD
- Cyber Orange: #D25514
- Carbonized Gray: #5A5C5F
- Eruption Green: #2F7D3C
- Cactus Gray: #8C9B82
- Ruby Red: #8B1A1A
- Desert Sand: #C3A56E
- Azure Gray: #6E8CAA

## Image Processing Workflow (Standard)
1. Take Bambu Studio screenshots with gray BG RGB(84,85,90)
2. Remove BG via flood fill from borders (tolerance: abs diff < 20 per channel)
3. Crop to content bounds with 20px padding
4. Normalize to 800x1100 canvas centered at 92% scale
5. Save as PNG — NO other modifications

## AWS Infrastructure
| Service | Resource |
|---|---|
| Amplify | bronco-buck app, main branch |
| DynamoDB | BroncoBuckBuilds, BroncoBuckOrders |
| IAM Role | bronco-buck-compute-role (DynamoDB + SES + SSM) |
| IAM Role | AWSAmplifyDomainRole-Z01222682JOH1P1Z7BZ0R |
| SSM | /bronco-buck/stripe-secret-key |
| SES | orders@buckthatduck.com (production access approved) |
| Route 53 | buckthatduck.com |

## What's Working
- Full site at www.buckthatduck.com
- 10 Ford color swatches with images
- Stripe payments (test mode)
- Orders saved to DynamoDB
- Order confirmation emails via SES
- Shared builds cross-device
- Andrew's dark theme (CSS variables, gold accent)
- %uckThatDuck branding in nav
- Password-protected orders page (password: 061970)

## Git Workflow
cd ~/bronco-buck
git add .
git commit -m "description"
git push origin main

## Todd's Preferences
- Execute tasks directly, no confirmation needed
- Project local path: /Users/home/bronco-buck/
