# Design Guidelines: CAPTCHA & Typing Job Automation Platform

## Design Approach
**Selected System:** Material Design + Linear-inspired productivity patterns
**Rationale:** This application requires clear information hierarchy, real-time status updates, and efficient task management. Material Design provides robust patterns for data-dense interfaces, while Linear's clean aesthetic ensures the tool feels modern and professional rather than overwhelming.

## Core Design Elements

### Typography
- **Primary Font:** Inter (via Google Fonts CDN)
- **Monospace Font:** JetBrains Mono (for earnings, IDs, API keys)
- **Hierarchy:**
  - Dashboard Title: text-3xl font-bold
  - Section Headers: text-xl font-semibold
  - Card Titles: text-base font-medium
  - Body Text: text-sm font-normal
  - Metadata/Stats: text-xs font-medium uppercase tracking-wide
  - Numbers/Earnings: text-2xl font-mono font-bold

### Layout System
**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, and 12 exclusively
- Component padding: p-4 or p-6
- Section spacing: gap-6 or gap-8
- Card spacing: space-y-4
- Button padding: px-6 py-3
- Icon margins: mr-2, ml-2

**Grid Structure:**
- Main container: max-w-7xl mx-auto px-4
- Two-column layout: grid grid-cols-1 lg:grid-cols-3 gap-6
  - Left sidebar (1 col): Job queue, filters
  - Main content (2 cols): Active tasks, dashboard stats

## Component Library

### Navigation
**Top Bar (Full-width, sticky):**
- Logo/branding (left)
- Navigation links: Dashboard, Jobs, Earnings, API Settings, Withdrawals
- User profile dropdown (right)
- Balance display with crypto/PayPal icons (right)

### Dashboard Cards
**Stats Cards (Top Row - 4 columns):**
- Total Earnings
- Jobs Completed Today
- Success Rate
- Pending Withdrawals
Each card: rounded-lg border, p-6, displays large number with icon and trend indicator

### Job Queue Section
**Active Jobs List:**
- Card-based layout with job type icon (CAPTCHA vs Typing)
- Job details: Platform name, task type, reward amount
- Status badge: "Processing", "Queued", "Completed", "Failed"
- Progress bar for active tasks
- Action buttons: "View Details", "Cancel" (for queued)

**Filters Bar:**
- Dropdown: Job Type (All, CAPTCHA, Typing)
- Toggle: Auto-process
- Sort by: Reward, Time, Difficulty

### Earnings Tracker
**Earnings Display:**
- Large prominent number (total balance)
- Breakdown table: Date, Job Type, Platform, Amount, Status
- Time period selector: Today, Week, Month, All Time
- Export button for transaction history

### Withdrawal Interface
**Withdrawal Card:**
- Payment method selector (tabs): PayPal, Crypto
- Amount input field with balance display
- Fee calculator showing net amount
- Withdrawal history list below
- Primary action button: "Withdraw Funds"

### API Integration Panel
**Connected Platforms List:**
- Card per platform with logo/icon
- Status indicator: Connected, Disconnected, Error
- Stats: Jobs completed, Success rate
- Action: "Configure", "Disconnect"
- "Add New Platform" button

### Task Monitoring Section
**Real-time Activity Feed:**
- Live log of task completions
- Scrollable list with timestamps
- Color-coded status indicators
- Auto-scroll to latest entry
- Pause/resume feed toggle

## Icons
**Library:** Heroicons (via CDN)
**Usage:**
- CheckCircle: Completed jobs
- XCircle: Failed jobs
- Clock: Queued tasks
- CurrencyDollar: Earnings
- Cog: Settings
- ChartBar: Analytics
- Lightning: Auto-process
- ArrowDownTray: Withdraw

## Animations
**Minimal, Purposeful Only:**
- Progress bar fills smoothly (transition-all duration-300)
- Status badge color changes (transition-colors)
- Earnings counter increments (number animation)
- NO scroll animations or page transitions

## Images
**Dashboard Hero (Optional Small Banner):**
- Subtle abstract tech pattern or gradient (top of dashboard)
- Height: h-32, full-width
- Contains welcome message overlay: "Welcome back, [User]"
- Can be omitted for maximum information density

**No other images needed** - this is a data-focused tool

## Layout Specifications

**Dashboard Page Structure:**
1. Top navigation bar (h-16)
2. Stats cards row (grid-cols-4)
3. Two-column layout:
   - Left: Job queue + filters (w-full lg:w-1/3)
   - Right: Activity feed + earnings (w-full lg:w-2/3)
4. Bottom: Withdrawal interface (full-width)

**Spacing Consistency:**
- Page padding: p-6 lg:p-8
- Card spacing: gap-6
- Section margins: mb-8
- List items: space-y-2

## Accessibility
- All interactive elements: focus:ring-2 focus:ring-offset-2
- Status indicators: Include text labels, not just colors
- Form inputs: Proper labels, placeholder text, error states
- Buttons: min-h-[44px] for touch targets
- Contrast ratios meet WCAG AA standards

## Critical Design Principles
1. **Information Density:** Pack data efficiently without clutter
2. **Status Clarity:** Always visible job status and earnings
3. **Quick Actions:** One-click job control and withdrawals
4. **Real-time Updates:** Live feeds for task completion
5. **Trust Signals:** Clear balance display, transaction history
6. **Performance First:** Fast loading, instant interactions

This design prioritizes function over form while maintaining a modern, professional aesthetic suitable for a productivity-focused automation tool.