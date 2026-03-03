# per-cc — Personal Command Center
**Product Development Requirements**
*Last updated: 2026-03-03 (Module 3 expanded)*

## Overview
Single-user personal command center web app for managing daily work, WordPress sites, trading journal, content pipeline, and automated notifications. Mobile-first, dark mode, bilingual (VI/EN).

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14 (App Router) | Serverless functions co-located |
| Styling | Tailwind CSS 3.4+ | Dark mode default, auto |
| Database + Auth | Supabase (PostgreSQL + Realtime) | Magic link auth (single user) |
| AI | Vercel AI SDK + OpenAI gpt-4-mini | Streaming, cost-efficient |
| Telegram | Telegram Bot API (webhook) | No polling; webhooks via Vercel |
| Sheets | Google Sheets API (service account) | Task sync, journal save |
| i18n | next-intl | VI + EN, App Router native |
| Deployment | Vercel | Native Next.js, cron support |

## 7 Modules

1. **Morning Briefing** — Tasks from Google Sheets + Zalo (manual input), AI prioritize, domain/uptime alerts
2. **WordPress Command Center** — 20-site monitor (uptime, RAM, disk, traffic), domain countdown, WP clone
3. **Web App Dev Tracker** — Tasks sync from Google Sheet (chị Hà's sheet) + Zalo (manual forward/input), task clarification helper (paste unclear task → AI generates clarifying questions), feature progress tracker (todo/in-progress/done/blocked), quick notes for requirements post-clarification, link to open Trae IDE directly, daily dev log (done/blocked/next)
4. **Trading Journal (DAC 7.0)** — 3x daily Telegram reminders, notes via Telegram, save to Sheets, win/loss stats
5. **Branding & Content Pipeline** — Idea → AI outline → FB post/blog/video script, content calendar
6. **Learning Tracker** — Morning reading reminder, AI tools log, daily English notes
7. **Auto Report & Notification** — EOD email, WP status + domain alerts + trading summary via Telegram

## Requirements

- Mobile-first, works on phone browser
- Dark mode default, light mode toggle
- Single user (no registration needed)
- Fast + minimal UI
- Vietnamese + English language support
- Telegram Bot for all notifications + quick inputs
