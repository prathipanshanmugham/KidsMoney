# Kids Money - PRD (Product Requirements Document)

## Original Problem Statement
Build a production-grade fintech-education SaaS application named "Kids Money" - a gamified allowance and financial literacy platform for kids, managed by parents, with no real money involved. Kids earn virtual money through tasks, save towards goals, and learn about financial concepts.

## Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, Shadcn/UI, Recharts
- **Backend:** FastAPI, Motor (async MongoDB driver), JWT Auth, Pydantic
- **Database:** MongoDB (deviation from original PostgreSQL spec)
- **Architecture:** Monolithic Full-Stack Application

## Core User Roles
- **Parent (Admin):** Manages kid profiles, creates tasks, sets goals, monitors progress
- **Kid (Sub-Account):** Completes tasks, earns coins, saves for goals, learns about finance

## DB Collections
- `users`: `{ id, email, full_name, password_hash, role: 'parent', created_at }`
- `kids`: `{ id, parent_id, name, age, avatar, grade, ui_theme, pin, level, xp, credit_score, created_at }`
- `wallets`: `{ id, kid_id, balance, total_earned, total_spent, total_saved }`
- `transactions`: `{ id, kid_id, type, amount, description, category, reference_id, created_at }`
- `tasks`: `{ id, parent_id, kid_id, title, description, reward_amount, penalty_amount, frequency, approval_required, status, created_at }`
- `goals`: `{ id, kid_id, parent_id, title, target_amount, saved_amount, deadline, status, created_at }`
- `sips`: `{ id, kid_id, parent_id, amount, interest_rate, frequency, total_invested, current_value, payments_made, status, created_at }`
- `loans`: `{ id, kid_id, parent_id, principal, interest_rate, duration_months, emi_amount, remaining_balance, payments_made, purpose, status, created_at }`
- `learning_progress`: `{ id, kid_id, story_id, score, completed_at }`

## What's Been Implemented

### Phase 1 - MVP (Complete)
- Parent authentication (signup/login)
- Kid profile management (add/edit/delete)
- Task & Reward System (create, complete, approve/reject)
- Wallet & Ledger System (balance, transactions)
- 10-Level Progression System with XP
- Gamified Credit Score (0-1000)
- Goals (create, contribute savings)
- SIP Engine (create, pay, compound interest calculation)
- Loan & EMI System (request, approve, pay EMIs)
- Learning Module (5 story-based lessons with quizzes)
- Parent Dashboard with kid overview
- Dark/Light mode support

### Phase 2 - Role-Based UI Separation (Complete - Feb 2026)
- **Backend RBAC:** `verify_parent` and `verify_kid` middleware, separate API endpoints for each role
- **Kid Login:** POST /api/auth/kid-login (parent email + kid name + PIN)
- **Frontend Route Protection:** `ParentRoute` redirects kids to /kid/dashboard, `KidRoute` redirects parents to /dashboard
- **Kid Interface:** Complete set of kid-specific pages (KidHome, KidTasks, KidWallet, KidGoals, KidSIP, KidLoans, KidLearning, KidAchievements)
- **KidLayout:** Themed sidebar and navigation with boy/girl/neutral color themes
- **Login UI:** Tabbed Parent/Kid login forms
- **AddKidForm:** Includes ui_theme selector and PIN field

## API Endpoints

### Auth
- `POST /api/auth/signup` - Parent registration
- `POST /api/auth/login` - Parent login
- `POST /api/auth/kid-login` - Kid login (parent_email, kid_name, pin)
- `GET /api/auth/me` - Current user info (works for both roles)

### Parent Routes (protected by verify_parent)
- `POST /api/kids` - Add kid
- `GET /api/kids` - List kids
- `GET/PUT/DELETE /api/kids/{kid_id}` - Kid CRUD
- `POST /api/tasks` - Create task
- `GET /api/tasks/{kid_id}` - List tasks
- `PUT /api/tasks/{task_id}/complete|approve|reject` - Task actions
- `GET /api/wallet/{kid_id}` - Get wallet
- `GET /api/wallet/{kid_id}/transactions` - Get transactions
- `POST /api/goals` - Create goal
- `GET /api/goals/{kid_id}` - List goals
- `PUT /api/goals/{goal_id}/contribute` - Contribute to goal
- `POST /api/sip` - Create SIP
- `GET /api/sip/{kid_id}` - List SIPs
- `POST /api/sip/{sip_id}/pay|pause` - SIP actions
- `POST /api/loans/request` - Request loan
- `GET /api/loans/{kid_id}` - List loans
- `POST /api/loans/{loan_id}/approve|pay` - Loan actions
- `GET /api/learning/stories` - Get stories
- `POST /api/learning/complete` - Complete lesson

### Kid Routes (protected by verify_kid)
- `GET /api/kid/me` - Kid profile with wallet/level info
- `GET /api/kid/dashboard` - Kid dashboard data
- `GET /api/kid/tasks` - Kid's tasks
- `PUT /api/kid/tasks/{task_id}/complete` - Complete task
- `GET /api/kid/wallet` - Kid's wallet
- `GET /api/kid/transactions` - Kid's transactions
- `GET /api/kid/goals` - Kid's goals
- `PUT /api/kid/goals/{goal_id}/contribute` - Contribute to goal
- `GET /api/kid/sip` - Kid's SIPs
- `POST /api/kid/sip/{sip_id}/pay` - Pay SIP
- `GET /api/kid/loans` - Kid's loans
- `POST /api/kid/loans/{loan_id}/pay` - Pay EMI
- `GET /api/kid/learning/stories` - Stories
- `GET /api/kid/learning/progress` - Learning progress
- `POST /api/kid/learning/complete` - Complete lesson
- `GET /api/kid/achievements` - Badges and stats

## Upcoming Tasks (Priority Order)
1. **P1:** Wishlist & Goals Module enhancement
2. **P1:** SIP Engine UI improvements
3. **P1:** Learning Module expansion (more stories)
4. **P2:** Backend refactoring (modularize server.py)
5. **P2:** AI-powered financial insights
6. **P2:** Multi-language support

## Known Deviations
- Database is MongoDB instead of originally requested PostgreSQL
- Backend is monolithic (single server.py) instead of modular
