# UGROW Platform — Full v0 Prompt

You are building UGROW, a premium marketing & restaurant data analysis platform for a UAE-based agency. Build a complete, production-ready frontend with exceptional design quality, rich animations, and full interactivity.

---

## BRAND & VISUAL IDENTITY (STRICT — DO NOT DEVIATE)

**Primary Colors:**
- White: `#FFFFFF` — backgrounds, card surfaces
- Red: `#FF305D` — accents, CTAs, active states, highlights
- Purple: `#2E1C5F` — headings, navbar, section headers, primary text elements

**Color Rule:** Never mix or blend these colors. No gradients between them. Each UI element uses ONE color only.

**Typography:** Use a premium, distinctive font pairing — NOT Inter, NOT Roboto, NOT Arial. Choose something with character befitting a data platform (e.g. DM Sans + DM Mono, or Outfit + Space Mono).

---

## SPLASH SCREEN (REFERENCE IMPLEMENTATION — MATCH THIS EXACT BEHAVIOR)

The existing SplashScreen works like this:
```jsx
// White background, full screen
// LOGO.png centered, width 400px
// On mount: fade-in animation (opacity 0→1, scale 0.8→1, duration 0.6s)
// After 1s: adds pulse animation to logo
// On click: logo moves up + fades out (duration 0.6s) → then transitions to app
// The whole screen is clickable
```

Recreate this with Framer Motion:
- `initial={{ opacity: 0, scale: 0.8 }}`
- `animate={{ opacity: 1, scale: 1, transition: { duration: 0.6 } }}`
- After 1s, add a gentle infinite pulse (scale 1→1.04→1, duration 2s, repeat)
- On click: `exit={{ opacity: 0, y: -80, transition: { duration: 0.6 } }}`
- Wrap in `<AnimatePresence>` for clean unmount
- White background, logo centered, cursor pointer

---

## CREATIVE FREEDOM (IMPORTANT)

You have **complete creative freedom** over:
- Overall layout and page composition
- How pages are divided and structured
- Navigation patterns (sidebar, top nav, tabs — your choice)
- Card designs, spacing, grid systems
- All animations and motion design — add as many rich animations as possible
- Microinteractions and hover states
- Visual hierarchy and information architecture
- Icons usage (use Lucide React)

The **only constraints** are:
1. The 3 brand colors above (White, Red #FF305D, Purple #2E1C5F)
2. The SplashScreen behavior described above
3. The functional requirements below

**Make it extraordinary. Make it memorable. Fill it with motion.**

---

## TECH STACK

```
React + TypeScript
Tailwind CSS
Framer Motion (USE HEAVILY)
shadcn/ui components
Lucide React icons
Zustand (state management)
TanStack Query
React Hook Form + Zod
react-i18next (EN default, AR with RTL)
```

---

## FULL APPLICATION STRUCTURE

### App Shell
- `AnimatePresence` wrapping the whole app for route transitions
- Page transitions: fade + slide up (`y: 20 → 0`, opacity `0→1`, 0.4s easeOut)
- Persistent navbar (after login)
- Language switcher always visible in navbar
- All assets preloaded (platform icons, logo, fonts)

---

### AUTHENTICATION

**Login Page:**
- Full-screen, white background
- LOGO.png centered top
- Clean login card with purple shadow
- Email field (shows `@ugrow.com` as static suffix — user only types prefix)
- Password field with Show.png / Hide.png toggle icons
- Submit button in `#FF305D`
- Error states with shake animation
- "Your account is on hold" / "Your account has been deactivated" messages in red
- Framer Motion entrance animations on the card

**Auth Rules:**
- Only `@ugrow.com` emails allowed — reject others with clear error
- Admin: `admin@ugrow.com` / `ugrow1@@`
- Two roles: `admin` and `client`

---

### ADMIN LAYOUT

After login as admin, show:

**Navigation (your creative choice — sidebar or top bar):**
- UGROW LOGO
- Restaurant Management tab
- Data Analysis tab  
- Language switcher (EN/AR icons)
- User info / logout

---

### ADMIN — RESTAURANT MANAGEMENT PAGE

**Restaurant List View:**
- Card grid layout
- Each restaurant card shows:
  - Profile image (or `No_Profile.png` placeholder) — circular, with subtle border
  - Restaurant name (bold, purple)
  - Status badge: Active (green) / Hold (yellow) / Deactivated (red)
  - Active platform icons row (Talabat.png, Keeta.png, Noon.png, Careem.png, Delivroo.png, Smiles.png)
  - Action buttons: Edit | View | Change Status
- Cards enter with stagger animation (`staggerChildren: 0.07s`, each card `y:30→0, opacity:0→1`)
- Hover: card scales to `1.02`, shadow increases, `transition: 0.2s`
- "Add Restaurant" button — prominent, red, fixed or floating position

**Add/Edit Restaurant Form (Modal or full page — your choice):**
Fields:
- Restaurant Name (required)
- Owner Name / Owner Phone
- Manager Name / Manager Phone  
- Area / Address (collapsible "Location" section with expand animation)
- Google Maps URL
- Profile Image upload (preview shown immediately, defaults to No_Profile.png)
- Platforms multi-select with platform icons (checkboxes with icon+name)
- Status select: active / hold / deactivated
- Client Username (prefix input + static `@ugrow.com` display)
- Client Password (with show/hide toggle)

**Platform Credentials sub-section** (per selected platform):
- Login Email + Password (encrypted at rest, visible to admin)
- For Deliveroo only: optional "Add Tablet Access" button → second credential row
- Show/hide password toggles using Show.png / Hide.png icons

**Change Status confirmation dialog:**
- Modal with confirmation message
- Purple confirm button / red cancel

---

### ADMIN — DATA ANALYSIS PAGE

**Analysis Session Flow (your choice: stepper, wizard, sidebar, or full-screen steps):**

**Step 1 — Select Restaurant:**
- Searchable dropdown with restaurant profile images + names
- Only active restaurants shown

**Step 2 — Select Date Range:**
- From Date + To Date pickers
- Clean calendar UI

**Step 3 — Select Platforms:**
- Multi-select cards with platform icons
- Only platforms registered for the selected restaurant shown
- Selected platforms get a red highlight / check mark
- Cards animate in with stagger

**Step 4 — Upload Sheets:**
One upload card per selected platform, showing:
- Platform icon + name
- File drop zone OR upload button
- Accepted file type label:
  - Talabat → `.xlsx`
  - Keeta → `.xlsx`
  - Noon → `.csv`
  - Smiles → `.xls`
  - Deliveroo → multiple `.csv` files
  - Careem → `.xlsx`
- Gear icon (⚙) per platform → opens Settings Panel
- On upload success: green banner slides down from top with spring physics ("File uploaded successfully ✓")
- File name shown after upload with remove option

**Platform Settings Panel (per platform, opens as slide-in panel or modal):**
- "Actual Sales Rate %" — number input 0-100
- "Food Cost %" — number input 0-100
- Changes recalculate KPIs in real-time (no reload)
- Smooth open/close animation (scale + fade, 0.3s)

---

### KPI RESULTS DISPLAY

After all uploads + settings configured:

**Tabs** (one per selected platform + "Total" tab):
- Tab switch: content fades out then fades in (cross-fade 0.3s)
- Active tab: red underline or red background

**Per-platform KPI Grid (10 KPI cards):**

KPIs and their formulas:
1. `Num_Orders` — count of orders
2. `Total_Sales` — sum of gross order values
3. `Discount` — vendor-funded discounts
4. `Earnings` = Total_Sales − Discount
5. `Actual_Sales` = Total_Sales × (Actual Sales Rate% ÷ 100)  ← needs user %
6. `Net_Revenue` — sum of payout amounts
7. `Expenses` = Earnings − Net_Revenue
8. `Difference` = Net_Revenue − Actual_Sales  ← needs user %
9. `Food_Cost` = Actual_Sales × (Food Cost% ÷ 100)  ← needs both %
10. `Difference_Cost` = Net_Revenue − Food_Cost  ← needs both %

**KPI Card design (your creative freedom):**
- KPI name
- Value with `AED` currency, 2 decimal places
- **Count-up animation**: number goes from 0 to final value over 1.2s using Framer Motion `useMotionValue` + `useTransform`
- Cards enter with stagger animation
- Hover: scale 1.03, shadow increase
- Cards that depend on user input (Actual_Sales, Difference, Food_Cost, Difference_Cost, Expenses): show warning/disabled state if percentages not set

**Total Tab:**
- Sum of all platform KPIs
- Difference and Difference_Cost recalculated from totals (not sum of differences)
- Same animated card layout

**Actions below results:**
- "Export Master Sheet" button (red, prominent)
- "Save Report to Restaurant History" button (purple)

---

### CLIENT LAYOUT

Different layout/navigation from admin. Simpler. More report-focused.

**Client Navigation Tabs:**
1. My Reports
2. Platform Credentials
3. About UGROW (placeholder — "Coming Soon" with nice animation)
4. Contact (placeholder — "Coming Soon")

---

### CLIENT — MY REPORTS TAB

- List of report cards
- Each card:
  - "Report: [From Date] to [To Date]"
  - Platform icons of included platforms
  - Date created
  - "View Report" button (red)
- Click "View Report" → opens full report view:
  - Read-only KPI tables (same animated cards as admin)
  - "Export to Excel" download button
  - Per-platform tabs + Total tab

---

### CLIENT — PLATFORM CREDENTIALS TAB

- One card per platform
- Platform icon + name
- Email field (plain text, visible)
- Password field (masked, Show.png/Hide.png toggle)
- "Copy" button next to each field
- For Deliveroo: if tablet credential exists, show as second row
- NO edit buttons — read-only

---

## ANIMATIONS GUIDE (USE ALL OF THESE)

**Required animations throughout the app:**

1. **Splash screen** — scale+fade in, pulse, then move-up exit
2. **Page transitions** — fade + slide up (`y:20→0`, 0.4s easeOut)
3. **Card stagger** — `staggerChildren: 0.07s`, each card `y:30→0, opacity:0→1`
4. **KPI count-up** — 0 → final value over 1.2s, easing
5. **Platform tab switch** — cross-fade 0.3s
6. **Modal open** — `scale: 0.95→1, opacity: 0→1`
7. **File upload success banner** — slide down from top with spring physics
8. **Button hover** — scale 1.03, shadow increase, transition 0.2s
9. **Platform icon hover** — scale 1.1, transition 0.15s
10. **Language switcher** — rotate + fade swap between EN and AR icon
11. **Loading skeleton** — shimmer animation on cards while data loads
12. **Settings panel open/close** — slide from right or scale+fade, 0.3s
13. **Status badge** — subtle pulse on "active" status
14. **Form field focus** — purple border glow
15. **Error shake** — horizontal shake on invalid submission
16. **Number inputs** — smooth value transitions
17. **Restaurant card hover** — lift + shadow
18. **Tab indicator** — sliding red underline (spring physics)
19. **Dropdown open** — height expand with opacity
20. **Toast/notification** — slide in from top-right, auto-dismiss with progress bar

---

## INTERNATIONALIZATION

- `EN` default
- `AR` secondary with full RTL (`dir="rtl"`)
- Language preference in localStorage
- Language switcher in navbar: `en_Lang.png` / `ar_Lang.png` icons
- Switching: current flag fades/scales out, new flag scales in
- When AR active: all flex directions flip, text alignment flips, padding flips
- Use `react-i18next` with translation keys

---

## MOCK DATA (use realistic UAE restaurant data)

```typescript
// Restaurants
const mockRestaurants = [
  { id: '1', name: 'Sharea Alkebda', status: 'active', platforms: ['talabat', 'keeta', 'noon', 'deliveroo'] },
  { id: '2', name: 'Bites Kitchen', status: 'active', platforms: ['talabat', 'careem', 'smiles'] },
  { id: '3', name: 'Gulf Shawarma', status: 'hold', platforms: ['talabat', 'noon'] },
  { id: '4', name: 'Al Bahar Grills', status: 'deactivated', platforms: ['keeta', 'careem'] },
]

// Sample KPI data (for Sharea Alkebda, Feb 2026, Talabat)
const mockKPIs = {
  talabat: {
    num_orders: 376,
    total_sales: 18420.50,
    discount: 2340.00,
    earnings: 16080.50,
    actual_sales: 13815.38,  // at 75%
    net_revenue: 12340.80,
    expenses: 3739.70,
    difference: -1474.58,
    food_cost: 4144.61,     // at 30%
    difference_cost: 8196.19
  },
  keeta: {
    num_orders: 218,
    total_sales: 9840.00,
    discount: 1230.00,
    earnings: 8610.00,
    actual_sales: 7380.00,
    net_revenue: 6540.20,
    expenses: 2069.80,
    difference: -839.80,
    food_cost: 2214.00,
    difference_cost: 4326.20
  }
}
```

---

## STATE MANAGEMENT (Zustand stores)

```typescript
// Auth store
interface AuthStore {
  user: { id: string; email: string; role: 'admin' | 'client'; restaurantId?: string } | null
  accessToken: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Analysis store  
interface AnalysisStore {
  selectedRestaurant: Restaurant | null
  dateRange: { from: Date; to: Date } | null
  selectedPlatforms: string[]
  uploadedFiles: Record<string, File[]>
  settings: Record<string, { actualSalesRate: number; foodCostRate: number }>
  kpiResults: Record<string, KPIData>
  setRestaurant: (r: Restaurant) => void
  setDateRange: (range: { from: Date; to: Date }) => void
  togglePlatform: (platform: string) => void
  setFile: (platform: string, files: File[]) => void
  updateSettings: (platform: string, settings: Partial<PlatformSettings>) => void
  setKPIResults: (results: Record<string, KPIData>) => void
}

// Language store
interface LanguageStore {
  locale: 'en' | 'ar'
  setLocale: (locale: 'en' | 'ar') => void
}
```

---

## FILE STRUCTURE

```
src/
├── assets/
│   └── (platform icons, logo, language icons imported from public/)
├── components/
│   ├── ui/               (shadcn components)
│   ├── layout/
│   │   ├── AdminLayout.tsx
│   │   ├── ClientLayout.tsx
│   │   ├── Navbar.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── splash/
│   │   └── SplashScreen.tsx
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── admin/
│   │   ├── restaurants/
│   │   │   ├── RestaurantList.tsx
│   │   │   ├── RestaurantCard.tsx
│   │   │   ├── RestaurantForm.tsx
│   │   │   └── PlatformCredentials.tsx
│   │   └── analysis/
│   │       ├── AnalysisWizard.tsx
│   │       ├── RestaurantSelect.tsx
│   │       ├── DateRangeSelect.tsx
│   │       ├── PlatformSelect.tsx
│   │       ├── UploadSheets.tsx
│   │       ├── PlatformUploadCard.tsx
│   │       ├── PlatformSettings.tsx
│   │       └── KPIResults.tsx
│   ├── kpi/
│   │   ├── KPICard.tsx
│   │   ├── KPITabPanel.tsx
│   │   └── KPICountUp.tsx
│   └── client/
│       ├── MyReports.tsx
│       ├── ReportCard.tsx
│       ├── ReportView.tsx
│       └── ClientCredentials.tsx
├── stores/
│   ├── authStore.ts
│   ├── analysisStore.ts
│   └── languageStore.ts
├── hooks/
│   ├── useCountUp.ts
│   └── useKPICalculations.ts
├── lib/
│   ├── kpiCalculations.ts
│   └── utils.ts
├── i18n/
│   ├── locales/
│   │   ├── en.json
│   │   └── ar.json
│   └── config.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## ROUTING

```typescript
// React Router v6
const routes = [
  { path: '/', component: SplashScreen },
  { path: '/login', component: LoginPage },
  // Admin routes (protected, role: admin)
  { path: '/admin', component: AdminLayout, children: [
    { path: 'restaurants', component: RestaurantManagement },
    { path: 'restaurants/new', component: RestaurantForm },
    { path: 'restaurants/:id/edit', component: RestaurantForm },
    { path: 'analysis', component: DataAnalysis },
  ]},
  // Client routes (protected, role: client)
  { path: '/client', component: ClientLayout, children: [
    { path: 'reports', component: MyReports },
    { path: 'reports/:id', component: ReportView },
    { path: 'credentials', component: ClientCredentials },
    { path: 'about', component: AboutPlaceholder },
    { path: 'contact', component: ContactPlaceholder },
  ]},
]
```

---

## KPI CALCULATIONS (implement exactly)

```typescript
// Dependency order — MUST follow this sequence
function calculateKPIs(
  sheetData: { numOrders: number; totalSales: number; discount: number; netRevenue: number },
  settings: { actualSalesRate: number; foodCostRate: number }
): KPIResult {
  const { numOrders, totalSales, discount, netRevenue } = sheetData
  const { actualSalesRate, foodCostRate } = settings

  const earnings = totalSales - discount
  const actualSales = totalSales * (actualSalesRate / 100)
  const expenses = earnings - netRevenue
  const difference = netRevenue - actualSales
  const foodCost = actualSales * (foodCostRate / 100)
  const differenceCost = netRevenue - foodCost

  return {
    numOrders,
    totalSales,
    discount,
    earnings,
    actualSales,
    netRevenue,
    expenses,
    difference,
    foodCost,
    differenceCost
  }
}

// Total tab — recalculate from totals, do NOT sum individual differences
function calculateTotals(platformResults: Record<string, KPIResult>): KPIResult {
  const platforms = Object.values(platformResults)
  const totalSales = sum(platforms.map(p => p.totalSales))
  const discount = sum(platforms.map(p => p.discount))
  const netRevenue = sum(platforms.map(p => p.netRevenue))
  const numOrders = sum(platforms.map(p => p.numOrders))
  // Recalculate — don't sum
  const earnings = totalSales - discount
  const actualSales = ... // need combined rate or per-platform
  const expenses = earnings - netRevenue
  // ... etc
  return { numOrders, totalSales, discount, earnings, netRevenue, expenses, ... }
}
```

---

## IMPORTANT IMPLEMENTATION NOTES

1. **SplashScreen**: Match the exact behavior from the reference JSX — white bg, logo 400px wide, fade+pulse, click to exit with logo moving up
2. **No gradients** between the 3 brand colors
3. **Each element uses ONE brand color** (white, red, or purple)
4. **Platform icons**: Reference as `/Talabat.png`, `/Noon.png`, `/Keeta.png`, `/Careem.png`, `/Delivroo.png`, `/Smiles.png`
5. **Logo**: `/LOGO.png`
6. **Show/Hide password**: `/Show.png` and `/Hide.png`
7. **Language icons**: `/en_Lang.png` and `/ar_Lang.png`
8. **No_Profile**: `/No_Profile.png`
9. All monetary values in AED, 2 decimal places
10. Framer Motion on **everything** — make it feel alive
11. shadcn/ui for form elements, dialogs, dropdowns
12. Skeleton loading states everywhere
13. Toast notifications for all actions (upload success, save, error)

---

## DELIVERABLE

Build the **complete frontend application** with:
- All pages fully implemented
- All animations working
- Mock data wired to all components
- State management connected
- Routing working
- i18n structure in place (EN keys, AR structure)
- All components listed above
- Production-quality code

Start with the app shell, routing, auth flow, and splash screen — then build outward to all pages.
