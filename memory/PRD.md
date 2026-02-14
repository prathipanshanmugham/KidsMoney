# Kids Money - PRD

## Problem Statement
Build a production-grade fintech-education ecosystem called "Kids Money" - a gamified allowance + financial literacy platform where kids earn virtual money via tasks, save toward goals, learn SIP/loans/EMI, and parents control everything. No real money involved.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI + Recharts
- **Backend**: FastAPI (Python) + MongoDB (Motor async driver)
- **Auth**: JWT (email/password)
- **Design**: Apple-like minimalist, Outfit + Plus Jakarta Sans fonts, dark mode

## User Personas
1. **Parent (Admin)**: Full control over kids, tasks, approvals, loan/SIP settings
2. **Kid (Sub Account)**: Gamified dashboard, tasks, wallet, goals, learning

## Core Requirements
- Parent signup/login (JWT auth)
- Add/manage multiple kids (unlimited)
- Task & reward engine (create, complete, approve/reject)
- Wallet & ledger (double-entry, credit/debit tracking)
- 10-level gamified progression (XP-based)
- Wishlist & savings goals
- SIP engine (compound interest calculations)
- Loan & EMI system (with credit score impact)
- Credit score (0-1000, gamified)
- Learning module (5 stories with quizzes)
- Dark mode toggle
- Mobile-first responsive UI

## What's Been Implemented (Feb 14, 2026)
- [x] Full backend API (21+ endpoints) - all tested and passing
- [x] Auth system (signup, login, JWT)
- [x] Kid management (add, edit, delete, list)
- [x] Task engine (create, complete, approve, reject with wallet impact)
- [x] Wallet & ledger system (balance, earned, spent, saved, full transaction history)
- [x] Goals system (create, contribute, delete with refund)
- [x] SIP engine (create, pay, pause, compound interest calculations, growth chart)
- [x] Loan & EMI system (request, approve, pay EMI, credit score impact)
- [x] Credit score system (0-1000, updated by task/EMI/saving activities)
- [x] 10-level progression (XP earned from all activities)
- [x] Learning module (5 stories with 3 quiz questions each, XP rewards)
- [x] Parent dashboard (overview, pending approvals, quick actions, recent activity)
- [x] Kid dashboard (gamified view with level progress, balance, tasks, goals)
- [x] Settings page (profile, dark mode toggle, kid management)
- [x] Landing page (hero, features, CTA)
- [x] Dark mode toggle (persisted in localStorage)
- [x] Mobile-responsive layout (sidebar + bottom nav)
- [x] All accessibility dialog descriptions added

## Prioritized Backlog
### P0 (Next Phase)
- [ ] SMS OTP authentication (Twilio integration)
- [ ] Task frequency auto-reset (daily/weekly tasks)
- [ ] SIP auto-deduction cron job
- [ ] EMI due date tracking with reminders

### P1
- [ ] Advanced reporting/analytics for parents
- [ ] More learning stories (expand to 20+)
- [ ] Achievement badges unlock system
- [ ] Avatar accessories unlocked by levels
- [ ] Password reset functionality

### P2
- [ ] AI-powered financial insights
- [ ] Multi-language support
- [ ] School integrations
- [ ] Freemium/premium tier system
- [ ] Push notifications
- [ ] Export reports (PDF/CSV)

## Next Tasks
1. Add SMS OTP with Twilio
2. Implement task frequency auto-reset
3. Add more learning content
4. Build achievement badge system
5. Add password reset flow
