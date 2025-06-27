Africa Tennis Platform
A comprehensive tennis tournament management platform built with a modern frontend stack, using Supabase for the database and authentication, and a serverless architecture for backend logic.

Architecture
Frontend: React (with Vite), TypeScript, and Tailwind CSS
State Management: Zustand for centralized, hook-based state management
Backend Services:
Database & Auth: Supabase is used for the PostgreSQL database, user authentication, and real-time updates.
Business Logic: Serverless functions on AWS Lambda handle specialized backend tasks like score processing.
Deployment: Intended for Netlify (or similar) for CI/CD.
Monitoring: Sentry for error tracking and performance monitoring.
Testing: Cypress for End-to-End testing.
Features
Authentication: Secure user sign-up, sign-in, and profile management powered by Supabase Auth.
Automated ELO Rating System: Player ratings are automatically calculated and updated after every completed match using PostgreSQL functions and triggers in the Supabase backend.
Match Management: Users can create individual matches, accept/decline challenges, and report final scores.
Tournament Module:
Create and view tournaments with different formats (Single Elimination, Round Robin, etc.).
Players can register for open tournaments.
Live Scoring (Umpire View): A dedicated dashboard for officials or players to score tournament matches live on a point-by-point basis.
Real-time Updates: Match scores and tournament statuses update in real-time for all viewers using Supabase Realtime subscriptions.
Theming: Includes both dark and light themes for user preference.
Getting Started
Prerequisites
Node.js 18+
A Supabase account
An AWS account (for deploying Lambda functions)
Sentry account (optional, for error tracking)
Installation
Clone the repository.
Install dependencies:
Bash

npm install
Copy the example environment file:
Bash

cp .env.example .env
Update the .env file with your credentials:
VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project.
VITE_API_BASE_URL for your AWS API Gateway that triggers your Lambda functions.
VITE_SENTRY_DSN from your Sentry project (optional).
Database Setup
Your Supabase database schema, policies, and functions are defined in the migration files.

Set up the Supabase CLI.
Link your local project to your Supabase project:
Bash

supabase link --project-ref <your-project-id>
Push the database migrations to deploy your schema:
Bash

supabase db push
This will run all files in supabase/migrations/ in order, setting up your tables, row-level security policies, and database functions.
Development
Start the local development server:

Bash

npm run dev
Testing
Run Cypress tests in an interactive mode:

Bash

npm run test
Run Cypress tests headlessly in the terminal:

Bash

npm run test:headless
Project Structure
src/
├── components/       # Reusable React components (UI)
│   ├── auth/
│   ├── dashboard/
│   ├── layout/
│   ├── matches/
│   └── tournaments/
├── contexts/         # React Context providers (Auth, Theme)
├── hooks/            # Custom React hooks (Not used yet, but planned)
├── lib/              # Client-side libraries (Supabase, Sentry, AWS)
├── pages/            # Top-level page components for routes
├── services/         # (Legacy) Client-side data services
├── stores/           # Zustand global state stores (auth, matches, etc.)
├── styles/           # Global and component-specific CSS
└── types/            # TypeScript type definitions (database, app types)
supabase/
├── functions/        # Serverless backend logic (Edge Functions/Lambdas)
└── migrations/       # Database schema and SQL migrations
Deployment Status
Phase 1: Core Infrastructure
[x] Supabase project setup
[x] Database schema and RLS policies defined in migrations
[x] Automated DB functions for user profile creation and ELO calculation
[x] User authentication flow with Zustand state management
[x] Core React application structure with routing
Phase 2: Feature Implementation
[x] User profile management and editing
[x] ELO rating system (automated by database)
[x] Match creation and final score reporting
[ ] Live point-by-point match scoring system
[ ] Real-time match score updates for spectators
Phase 3: Advanced Features
[ ] Tournament bracket generation and visualization
[ ] Player statistics and analytics dashboard
[ ] User-to-user notification system
Phase 4: Production Deployment
[ ] Netlify CI/CD pipeline configuration
[ ] Production environment setup for AWS Lambda
[ ] Full Sentry integration for monitoring and logging
[ ] Performance optimization and code splitting
Contributing
Fork the repository.
Create a new feature branch (git checkout -b feature/new-feature-name).
Make your changes.
Commit your changes (git commit -m 'Add some amazing feature').
Push to the branch (git push origin feature/new-feature-name).
Open a Pull Request.
License
This project is licensed under the MIT License.