# Kids Money - PRD (Product Requirements Document)

## Original Problem Statement
Build a production-grade fintech-education SaaS application named "Kids Money" - a gamified allowance and financial literacy platform for kids, managed by parents, with no real money involved. Kids earn virtual money through tasks, save towards goals, and learn about financial concepts.

## Architecture (Post-Migration - Feb 2026)
- **Frontend:** Angular 20 (standalone components, Tailwind CSS 4)
- **Backend:** NONE (Serverless)
- **Auth:** Firebase Authentication (Email/Password for parents, anonymous + PIN for kids)
- **Database:** Firebase Firestore
- **Hosting:** Angular dev server on port 3000 (Emergent preview)

## Firebase Project
- **Project ID:** sample-firebase-ai-app-2775f
- **Auth Domain:** sample-firebase-ai-app-2775f.firebaseapp.com
- **Firebase Auth Status:** ✅ WORKING
- **Firestore Status:** ✅ WORKING

## Core User Roles
- **Parent (Admin):** Manages kid profiles, creates tasks, sets goals, monitors progress
- **Kid (Sub-Account):** Completes tasks, earns coins, saves for goals, learns about finance

## Firestore Collections
- `users/{uid}` - Parent profile (using Firebase Auth UID as doc ID)
- `kids/{kidId}` - Kid profiles (with parent_uid, name, age, avatar, ui_theme, pin, level, xp, credit_score)
- `wallets/{kidId}` - Wallet data (balance, total_earned, total_spent, total_saved)
- `transactions/{txnId}` - Transaction history (kid_id, type, amount, description, category)
- `tasks/{taskId}` - Tasks (parent_uid, kid_id, title, reward_amount, status)
- `goals/{goalId}` - Savings goals (kid_id, title, target_amount, saved_amount, status)
- `sips/{sipId}` - SIP investments (kid_id, amount, interest_rate, total_invested, current_value)
- `loans/{loanId}` - Loans (kid_id, principal, emi_amount, remaining_balance, status)
- `learning_progress/{progressId}` - Completed lessons (kid_id, story_id, score)

## What's Been Implemented

### Phase 1 - React MVP (Complete, now deprecated)
- Original React + FastAPI + MongoDB implementation
- All features implemented but replaced by Angular migration

### Phase 2 - Angular 20 + Firebase Migration (Complete - Feb 2026)
- **Full frontend rewrite** from React to Angular 20 with standalone components
- **Serverless architecture** - removed FastAPI backend entirely
- **Firebase Auth** integration for parent email/password authentication
- **Firebase Firestore** integration for all data persistence
- **Kid login** via parent email + kid name + PIN (with Firestore verification)
- **Role-based routing** with async guards (parentGuard, kidGuard, publicGuard)
- **Parent Interface:** Dashboard, Tasks, Wallet, Goals, SIP, Loans, Learning, Settings (8 pages)
- **Kid Interface:** Home, Tasks, Wallet, Goals, SIP, Loans, Learning, Achievements (8 pages)
- **UI Themes:** Boy (blue), Girl (purple), Neutral (green) for kid interface
- **Dark/Light mode** toggle with localStorage persistence
- **SVG icons** properly sanitized with DomSanitizer
- **Graceful error handling** for Firestore unavailability with timeouts
- **Tailwind CSS 4** with custom CSS variables for theming

### Phase 3 - UI/UX Design System (Complete - Feb 2026)
- **Complete CSS Design System** with consistent styling across all pages
- **Card components** with subtle shadows and hover effects
- **Input fields** with focus states and proper styling
- **Primary buttons** with teal gradient and hover animations
- **Badges** for status indicators
- **Glassmorphism effects** for navigation
- **Dark mode support** with CSS variables
- **Responsive design** for mobile and desktop

## File Structure
```
/app/frontend/
├── angular.json
├── package.json
├── tsconfig.json
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.css (Complete design system)
    └── app/
        ├── app.ts (root component)
        ├── app.config.ts (Firebase providers)
        ├── app.routes.ts (all routes with lazy loading)
        ├── environments/environment.ts (Firebase config)
        ├── constants/app-data.ts (levels, stories, themes)
        ├── models/interfaces.ts (TypeScript interfaces)
        ├── services/
        │   ├── auth.service.ts (Firebase Auth + session management)
        │   ├── firestore.service.ts (all Firestore CRUD)
        │   └── theme.service.ts (dark/light mode)
        ├── guards/auth.guard.ts (route protection)
        ├── layouts/
        │   ├── parent-layout.ts (sidebar + header)
        │   └── kid-layout.ts (themed sidebar)
        └── pages/ (16 page components)
```

## Testing Status
- **iteration_4.json:** 24/24 frontend tests passed (100%)
- All pages render correctly
- Auth flow works (signup, login)
- Navigation works (sidebar, mobile)
- Dark mode toggle works
- Forms and modals work

## Upcoming Tasks
1. **P1:** Test full CRUD operations with Firebase (add kids, create tasks, etc.)
2. **P1:** Add Firestore security rules for production
3. **P1:** Implement real-time listeners for live data updates
4. **P2:** Add Firebase Cloud Functions for kid PIN hashing
5. **P2:** Multi-language support
6. **P2:** PWA support for mobile
