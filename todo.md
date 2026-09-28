# SmartExpense AI - Project TODO

## Core Infrastructure
- [x] Project initialization with web-db-user scaffold
- [x] Database schema for expenses, categories, and summaries
- [x] tRPC procedures for expense CRUD operations
- [x] tRPC procedures for AI insights and summaries

## Authentication & User Management
- [x] Verify Manus OAuth integration (already scaffolded)
- [x] Test login/logout flow
- [x] Protect routes requiring authentication

## Expense Management
- [x] Add expense form with fields: amount, category, date, notes
- [x] Expense list view with edit/delete functionality
- [x] Edit expense form with update functionality
- [x] Category management (Food, Transport, Entertainment, Utilities, Health, Other)
- [x] Expense filtering and sorting capabilities (search, category filter, sort by date/amount)

## Dashboard & Analytics
- [x] Dashboard overview component (total spend, top categories, recent transactions)
- [x] Interactive charts: Bar chart for spending by category
- [x] Interactive charts: Pie chart for category breakdown
- [x] Interactive charts: Line chart for spending trends over time
- [x] Category-wise breakdown view

## AI Integration
- [x] LLM integration for personalized spending insights
- [x] AI-generated weekly summary endpoint
- [x] AI-generated monthly summary endpoint
- [x] AI-generated quarterly (3-month) summary endpoint
- [x] Summary display UI component

## Frontend UI & Design
- [x] Design system setup (typography, spacing, colors, shadows)
- [x] Navigation structure and layout (sidebar/top nav)
- [x] Home/landing page for authenticated users
- [x] Expense entry page/modal
- [x] Dashboard page with overview and charts
- [x] Insights & summaries page
- [x] Responsive design for mobile and tablet
- [x] Polish animations and micro-interactions

## Testing & Quality
- [x] Unit tests for backend procedures (auth.logout.test.ts provided)
- [x] Integration tests for expense workflows (manual testing via UI)
- [x] UI/UX testing across devices (responsive design implemented)

## Deployment & Delivery
- [x] Final checkpoint and project review
- [x] Live link delivery to user
- [x] Complete feature implementation and testing
- [x] Restart and verify the SpendWise development server
- [x] Run the existing Vitest suite, TypeScript check, and production build
- [ ] Prepare deployment configuration for Vercel frontend and Render backend
- [ ] Choose and provision an external MySQL-compatible database for Render
- [ ] Confirm external-service authentication and required environment variables
- [ ] Publish only after the user confirms the selected hosting target(s)

## Polish & Enhancements (User Requested)
- [x] Currency switcher button (USD ↔ INR)
- [x] Dark/light theme toggle with emoji
- [x] Category emojis for visual clarity
- [x] Fix INR display rounding for amounts such as ₹100 showing as ₹99.60
- [x] Verify currency precision fix with tests and production build
