# NF-e Personal Expense Dashboard

A personal Brazilian fiscal notes (NFC-e / NF-e) visualization dashboard for tracking purchases from SEFAZ-BA. This single-user application allows importing, exploring, and analyzing approximately 44 fiscal notes through an intuitive interface with detailed charts and drill-down capabilities.

**Experience Qualities**:
1. **Analytical** - Clear data visualization prioritizing insights into spending patterns and price trends
2. **Efficient** - Quick access to information with minimal friction between data import and exploration
3. **Trustworthy** - Accurate financial calculations with proper Brazilian currency formatting that feels native

**Complexity Level**: Light Application (multiple features with basic state)
This is a personal analytics tool with multiple interconnected views (import, overview, list, detail, search) centered around a single dataset stored in KV. While it includes charts and filtering, it maintains focused functionality without complex workflows or extensive state management.

## Essential Features

### Data Import & Persistence
- **Functionality**: Accept JSON array via textarea, validate structure, persist to KV
- **Purpose**: Single entry point for all fiscal note data with permanent storage
- **Trigger**: User pastes JSON into textarea and clicks "Load notes"
- **Progression**: Empty state → Paste JSON → Click load → Validation → Store in KV (`"notes"`) → Redirect to Overview
- **Success criteria**: Data persists across sessions, invalid JSON shows helpful error message

### Overview Dashboard
- **Functionality**: Display aggregate KPIs and visual spending analysis
- **Purpose**: Immediate insight into total spending behavior and patterns
- **Trigger**: User navigates to Overview (default after import)
- **Progression**: Load notes from KV → Calculate totals → Render 4 KPI cards → Display top 10 merchants bar chart → Show monthly spending trend chart
- **Success criteria**: All calculations match manual verification, charts render with proper Brazilian currency formatting

### Notes List (Extrato)
- **Functionality**: Searchable, sortable table of all fiscal notes
- **Purpose**: Quick scanning of transaction history with merchant filtering
- **Trigger**: User clicks "Extrato" in navigation
- **Progression**: Display all notes sorted by date descending → User types in search → Filter by merchant name → Click row → Open detail panel
- **Success criteria**: Search filters instantly, table handles 44+ notes smoothly, clicking opens correct note detail

### Note Detail View
- **Functionality**: Full breakdown of single fiscal note with item-level detail
- **Purpose**: Verify individual purchase composition and line items
- **Trigger**: User clicks any row in Notes List
- **Progression**: Open slide-over panel → Display merchant header and date → Show items table with quantities and prices → User closes or navigates back
- **Success criteria**: All items displayed with correct prices, panel can be dismissed easily

### Items & Prices Analysis
- **Functionality**: Search products across all notes, track price evolution over time
- **Purpose**: Compare prices for same item across different merchants and dates
- **Trigger**: User navigates to "Items & Prices" and searches for product
- **Progression**: User enters product description → Filter items across all notes → Display matches table sorted by date → Show price trend line chart → Display min/max/avg summary
- **Success criteria**: Partial text matching works, chart visualizes price changes clearly, statistics are accurate

## Edge Case Handling
- **Empty/Invalid JSON**: Show inline error with helpful message, don't clear textarea
- **No data loaded**: Show import screen exclusively with clear instructions
- **Empty search results**: Display "No notes found" or "No items match" with friendly message
- **Single note**: Charts still render (bar chart with one bar, line chart with one point)
- **Missing fields**: Handle gracefully with fallback values (e.g., "—" for missing merchant)
- **Large datasets**: Tables use virtual scrolling or pagination if needed (though 44 notes is small)

## Design Direction
The design should evoke confidence and clarity—like a personal accountant's ledger reimagined for the modern web. It should feel distinctly Brazilian through currency formatting and color choices while maintaining a clean, data-forward aesthetic. The experience should be calm and focused, with charts and numbers taking center stage without visual clutter.

## Color Selection

**Primary Color**: Deep teal (`oklch(0.45 0.12 200)`) — conveys financial trustworthiness and professionalism while feeling modern and approachable, used for primary actions and navigation highlights

**Secondary Colors**: 
- Warm slate (`oklch(0.35 0.02 250)`) for secondary UI elements and muted backgrounds
- Soft sage (`oklch(0.75 0.08 150)`) for positive indicators and success states

**Accent Color**: Vibrant yellow-orange (`oklch(0.72 0.15 75)`) — energetic and attention-grabbing for CTAs, chart highlights, and important metrics. Distinctly Brazilian in character.

**Foreground/Background Pairings**:
- Background (`oklch(0.98 0 0)`) with Foreground (`oklch(0.25 0.01 250)`) — Ratio 12.8:1 ✓
- Primary (`oklch(0.45 0.12 200)`) with White (`oklch(1 0 0)`) — Ratio 5.2:1 ✓
- Accent (`oklch(0.72 0.15 75)`) with Dark text (`oklch(0.25 0.01 250)`) — Ratio 6.8:1 ✓
- Card (`oklch(1 0 0)`) with Foreground (`oklch(0.25 0.01 250)`) — Ratio 14.1:1 ✓

## Font Selection
Typography should balance readability for financial data with personality that feels contemporary and Brazilian. Numbers must be highly legible, while headings can express more character.

**Primary Typeface**: **Work Sans** (headings and UI) — geometric sans with friendly warmth
**Secondary Typeface**: **JetBrains Mono** (numbers, currency, dates) — excellent monospace for tabular data alignment
**Body Text**: **Inter** (descriptions, labels) — neutral and highly readable

**Typographic Hierarchy**:
- H1 (Page Title): Work Sans Bold / 32px / tight letter-spacing (-0.02em)
- H2 (Section Headers): Work Sans Semibold / 24px / normal
- H3 (Card Titles): Work Sans Medium / 18px / normal
- Body (Labels): Inter Regular / 14px / line-height 1.5
- Financial Data: JetBrains Mono Medium / 16px / tabular-nums
- KPI Large: JetBrains Mono Bold / 40px / tabular-nums

## Animations
Animations should emphasize data transitions and provide feedback without delaying access to information. Use subtle motion to guide attention during data loading and filtering, with satisfying micro-interactions on buttons and cards. Keep chart animations brief (300ms) to reveal insights quickly. Panel slide-ins should feel smooth and physics-based (400ms easing).

## Component Selection

**Components**:
- **Card**: KPI metrics, section containers with subtle shadows
- **Table**: Notes list and items tables with hover states, modified with striped rows for easier scanning
- **Textarea**: JSON import field with monospace font
- **Button**: Primary for "Load notes", secondary for navigation and actions
- **Input**: Search fields with magnifying glass icon from Phosphor
- **Sheet**: Note detail slide-over panel from right side
- **Badge**: Merchant UF tags, item counts
- **Alert**: Error messages for invalid JSON
- **Separator**: Visual breaks between dashboard sections

**Customizations**:
- Custom currency formatter component for consistent Brazilian formatting
- Custom date formatter for DD/MM/YYYY display
- Table component enhanced with search highlighting
- Chart color scheme customized to match brand colors (teal, sage, yellow-orange)

**States**:
- Buttons: Subtle scale on hover (0.98), pressed state with reduced shadow, disabled with 50% opacity
- Table rows: Background change on hover, selected row highlighted with primary color tint
- Search inputs: Focus ring in accent color, clear icon appears on input
- Cards: Gentle lift on hover (shadow increase), smooth transition 200ms

**Icon Selection**:
- **MagnifyingGlass**: Search functionality
- **Receipt**: Notes/receipts navigation
- **ChartBar**: Overview/dashboard
- **Package**: Items & Prices
- **Upload**: Import action
- **X**: Close panels, clear data
- **CaretDown**: Sort indicators
- **Trash**: Delete/clear actions

**Spacing**:
- Container padding: `px-6 py-8` (desktop), `px-4 py-6` (mobile)
- Card internal padding: `p-6`
- Section gaps: `gap-8` between major sections
- Card grid gap: `gap-4`
- Table cell padding: `px-4 py-3`
- Tight groups: `gap-2` for related elements

**Mobile**:
- Stack KPI cards vertically on mobile (grid-cols-1)
- Tables become horizontally scrollable with fixed first column
- Charts reduce height and font sizes
- Navigation converts to bottom tab bar or hamburger menu
- Sheet panels take full screen width on mobile
- Search moves to top with larger touch targets
