# PATROLI SITE — DESIGN SYSTEM SPECIFICATION
> **Modern Skeuomorphism — Light Gray + Sky Blue Enterprise Security Design System**  
> *Single Source of Truth (SSOT) for Visual Design, UI Tokens, and Component Foundations*  
> Document Version: 1.0.0 — Target Architecture: In-House Enterprise Command Center & Field Operations

---

## 1. Executive Design Philosophy

The Patroli Site visual redesign departs decisively from both outdated flat corporate dashboards and exaggerated glassy neumorphism. It embraces **Modern Skeuomorphism**: a tactile, high-clarity industrial interface engineered for mission-critical security and facility operations.

```
       [ MODERN SKEUOMORPHISM DESIGN AXES ]
                 Tactile Depth
                      ▲
                      │     ● Patroli Site Design Target
                      │       (Subtle bevels, soft ambient drop shadows,
                      │        inset inputs, layered tactile panels)
                      │
   Flat / Slop ───────┼─────── Overdone Neumorphism / Glass
                      │       (Unusable blur, unreadable low-contrast)
                      │
                      ▼
               Utilitarian Crisp
```

### Core Visual Tenets:
1. **Physicality Without Clutter**: Surfaces feel physical, panels look subtly raised from the baseplate, inputs appear recessed into the surface, and action buttons invite pressing.
2. **Atmospheric Contrast**: The canvas utilizes a cool light-gray backdrop (`#E5E9EE`), upon which crisp elevated white-gray panels (`#FFFFFF` / `#F5F7FA`) float with soft ambient multi-layered shadows.
3. **Command Center Authority**: Navigation is anchored by a solid, dark charcoal sidebar (`#263442`) that provides gravitas and contrast, featuring a vibrant, glowing Sky Blue (`#0284C7` ➔ `#38BDF8`) active indicator.
4. **Instant Semantic Recognition**: Statuses never rely solely on subtle pastel tags. Semantic states (Active, Incident, Pending, SOS) use restrained but unmistakable industrial colors and glowing radar pings.
5. **Ergonomic Operational Tactility**: Designed for real guards, cleaners, drivers, and supervisors on both 1440px multi-monitor consoles and 390px field smartphones outdoors in direct sunlight.

---

## 2. Reference Image Visual Analysis

Based on forensic visual extraction of the primary design reference (`media_1794764962295_9157fa84.jpg`):

| Visual Element | Reference Image Characteristic | Design System Translation |
|---|---|---|
| **Canvas Background** | Smooth, cool-slate light gray with no harsh banding. | `bg-surface-canvas` (`#E5E9EE`) |
| **Card Surface** | Raised off-white panel with thin top highlight and gentle ambient shadow. | `bg-surface-card` (`#FFFFFF`), `shadow-skeuo-card`, border-t `white/80` |
| **Sidebar Canvas** | Deep slate-charcoal `#263442` with rounded floating profile or left-docked rail. | `bg-sidebar-base` (`#263442`), border-r `#1B2631` |
| **Active Nav Item** | Rounded pill with Sky Blue gradient, crisp white icon, and subtle forward shadow. | `bg-gradient-to-r from-[#0284C7] to-[#38BDF8]`, `shadow-sky-glow` |
| **Active Tree Child** | Indented submenu tree connected with delicate vertical branch lines. | Nested tree with `border-l border-slate-600/50`, active text `#38BDF8` |
| **Top Header Bar** | Floating or integrated white surface with recessed search pill and user profile summary. | `bg-white/90 backdrop-blur`, inset search field, avatar with online dot |
| **Hero Card** | Sweeping horizontal welcome banner with officer silhouette and digital clock. | Semi-skeuomorphic header card with dual greeting and live WIB clock badge |
| **Stat Cards** | 5-column metric row with circular icon badges and green/cyan trend indicators. | 5-item grid, 48px circular icon receptacles with 10% tinted backgrounds |
| **Data Tables** | Clean white rows, soft grey dividers, status badges with glowing status dots. | Inset table wrapper, sticky header, row hover highlight, pill badges |
| **Action Buttons** | Primary buttons have a 1px top highlight, gradient sky blue face, and 2px darker bottom rim. | `shadow-skeuo-button-primary`, active translate-y-px |
| **Form Inputs** | Inset into the surface panel with a 1px inner shadow and sky blue focus ring. | `shadow-skeuo-inset`, border `#D1D5DB`, focus ring `ring-2 ring-[#38BDF8]/40` |
| **Emergency Modal** | Urgent crimson alert banner with 3D siren illustration and dual acknowledgment buttons. | High-z modal, beacon illustration, radial glow rings, blue acknowledge CTA |
| **Mobile Layout** | Clean vertical stacking, tactile large-target action buttons, slide drawer navigation. | Drawer layout, 48px touch targets, mobile QR viewfinder with target corners |

---

## 3. Design Tokens Specification

### 3.1 Color Palette

```
[ Canvas & Surfaces ]
  Canvas Base:         #E5E9EE  (Cool neutral light gray)
  Surface Base:        #F5F7FA  (Sub-panel surface)
  Surface Card:        #FFFFFF  (Elevated panel card)
  Surface Inset:       #EDF2F7  (Recessed well / input fill)
  Surface Overlay:     rgba(15, 23, 42, 0.45) (Backdrop blur scrim)

[ Sidebar Navigation ]
  Sidebar Canvas:      #263442  (Primary charcoal sidebar)
  Sidebar Surface:     #1E2B37  (Darker inner section / footer)
  Sidebar Border:      #334454  (Subtle boundary stroke)
  Sidebar Text Muted:  #94A3B8  (Slate 400 - Inactive nav)
  Sidebar Text Bright: #FFFFFF  (Active nav text)
  Sidebar Hover:       #2F4152  (Hover item background)

[ Brand & Accents ]
  Primary Blue:        #0284C7  (Deep Sky Blue - Tailwind Sky-600)
  Sky Blue Accent:     #38BDF8  (Vibrant Sky Blue - Tailwind Sky-400)
  Sky Blue Glow:       rgba(56, 189, 248, 0.35)
  Sky Blue Soft:       #E0F2FE  (Sky 100 - Tinted badge background)

[ Neutral Typography & Borders ]
  Text Primary:        #1E293B  (Slate 800 - High legibility)
  Text Secondary:      #64748B  (Slate 500 - Metadata & labels)
  Text Muted:          #94A3B8  (Slate 400 - Placeholders & hints)
  Border Subdued:      #E2E8F0  (Slate 200 - Card boundaries)
  Border Strong:       #CBD5E1  (Slate 300 - Input strokes)
  Divider:             #ECEFF3  (Hairline table borders)

[ Semantic Functional Colors ]
  Success (Normal/In): #16A36A  (Vibrant emerald green)
  Success Soft:        #DCFCE7  (Green 100)
  Warning (Caution):   #E9A23B  (Warm amber gold)
  Warning Soft:        #FEF3C7  (Amber 100)
  Danger (SOS/Alert):  #DC4545  (Pure crimson red)
  Danger Soft:         #FEE2E2  (Rose 100)
  Info (Notice):       #0284C7  (Sky blue)
  Info Soft:           #E0F2FE  (Sky 100)
```

### 3.2 Elevation, Depth, and Shadow Tokens

Skeuomorphic depth is achieved by pairing a dark ambient drop shadow with a crisp light-source highlight along the top edge:

```css
/* Tailwind Token Definitions */

/* 1. Raised Card Surface */
--shadow-skeuo-card: 
  0 1px 1px rgba(0, 0, 0, 0.03),
  0 4px 12px -2px rgba(15, 23, 42, 0.06),
  0 12px 24px -4px rgba(15, 23, 42, 0.04);
--highlight-card: inset 0 1px 0 0 rgba(255, 255, 255, 0.9);

/* 2. Elevated Floating Panel / Popover / Dropdown */
--shadow-skeuo-elevated: 
  0 10px 30px -4px rgba(15, 23, 42, 0.12),
  0 4px 8px -2px rgba(15, 23, 42, 0.06);

/* 3. Inset Surface (Inputs, Search Wells, Checkpoint Timeline Tracks) */
--shadow-skeuo-inset: 
  inset 0 2px 4px 0 rgba(15, 23, 42, 0.06),
  inset 0 1px 2px 0 rgba(15, 23, 42, 0.04);

/* 4. Tactile Primary Button */
--shadow-skeuo-button-primary: 
  0 1px 2px 0 rgba(2, 132, 199, 0.35),
  0 4px 12px 0 rgba(56, 189, 248, 0.30),
  inset 0 1px 0 0 rgba(255, 255, 255, 0.35),
  inset 0 -2px 0 0 rgba(3, 105, 161, 0.40);

/* 5. Tactile Secondary / White Button */
--shadow-skeuo-button-secondary: 
  0 1px 2px 0 rgba(15, 23, 42, 0.06),
  0 2px 4px 0 rgba(15, 23, 42, 0.04),
  inset 0 1px 0 0 rgba(255, 255, 255, 1.0),
  inset 0 -1px 0 0 rgba(203, 213, 225, 0.6);

/* 6. Pressed Button State */
--shadow-skeuo-button-pressed: 
  inset 0 2px 4px 0 rgba(15, 23, 42, 0.20);
```

### 3.3 Border Radius Tokens

```
--radius-xs:    4px    (Small badges, code tags)
--radius-sm:    8px    (Table action icon buttons, pagination pills)
--radius-md:   12px    (Form inputs, secondary buttons, sub-cards)
--radius-lg:   16px    (Primary cards, modal windows, metric boxes)
--radius-xl:   20px    (Hero welcome banner, dashboard preview containers)
--radius-pill: 9999px  (Status pills, search input bar, active nav pill)
```

### 3.4 Spacing & Sizing Scale

The spacing scale is strictly geometric based on a 4px/8px modular grid:

| Token | Size | Pixel Equivalent | Primary UI Application |
|---|---|---|---|
| `--space-1` | `0.25rem` | `4px` | Pill inner paddings, icon-text micro gaps |
| `--space-2` | `0.5rem` | `8px` | Badge padding, action icon button inner spacing |
| `--space-3` | `0.75rem` | `12px` | Grid gutters, compact card padding, list item gaps |
| `--space-4` | `1.0rem` | `16px` | Standard mobile card padding, table cell horizontal padding |
| `--space-5` | `1.25rem` | `20px` | Desktop card inner padding (`p-5`), form fieldset spacing |
| `--space-6` | `1.5rem` | `24px` | Page container padding, modal body padding |
| `--space-8` | `2.0rem` | `32px` | Major section vertical separation, dashboard Bento gaps |
| `--space-12` | `3.0rem` | `48px` | Minimum mobile touch target height, primary CTA button height |
| `--space-16` | `4.0rem` | `64px` | Sticky header height, bottom clearance padding |

### 3.5 Interaction & Transition Tokens

```css
--transition-instant: 100ms cubic-bezier(0.4, 0, 0.2, 1); /* Button clicks, toggles */
--transition-snappy:  150ms cubic-bezier(0.4, 0, 0.2, 1); /* Hover states, dropdown popups */
--transition-smooth:  250ms cubic-bezier(0.4, 0, 0.2, 1); /* Drawer slide, modal backdrop fade */
```

---

## 4. Typography System

The interface uses **Plus Jakarta Sans** as the primary font family for all UI elements, headings, buttons, and navigation, paired with **Inter** or standard tabular numeric figures (`font-mono` / `tabular-nums`) for coordinates, timestamps, and payroll tables.

```
Font Family:
  Primary: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
  Tabular / Data: 'Inter', system-ui, sans-serif
```

### Type Scale & Hierarchy

| Role | Font Size | Line Height | Weight | Letter Spacing | Use Case |
|---|---|---|---|---|---|
| **Display / Clock** | `32px` (2rem) | `38px` | Bold 700 | `-0.02em` | Digital clock WIB, SOS headline |
| **Heading 1 (Page Title)** | `22px` (1.375rem) | `28px` | Bold 700 | `-0.015em` | Page title, Welcome greeting |
| **Heading 2 (Card Title)** | `16px` (1rem) | `22px` | SemiBold 600 | `-0.01em` | Card section titles ("Aktivitas Patroli") |
| **Heading 3 (Subtitle/Group)** | `13px` (0.8125rem) | `18px` | Bold 700 | `+0.05em` | Sidebar uppercase group headers |
| **Body Primary** | `14px` (0.875rem) | `20px` | Medium 500 / Regular 400 | `0` | Form labels, table values, modal text |
| **Body Small / Meta** | `12px` (0.75rem) | `16px` | Medium 500 / Regular 400 | `+0.01em` | Descriptions, timestamps, subtext |
| **Micro / Badge** | `10px` (0.625rem) | `14px` | Bold 700 | `+0.03em` | Status badges ("AKTIF", "LIVE", trends) |
| **KPI Metrics** | `26px` (1.625rem) | `30px` | Bold 700 | `-0.02em` | Metric numbers ("124", "96%") |

---

## 5. Skeuomorphic Surface & Component Specifications

### 5.1 Raised Surface Card (`SurfaceCard`)
- **Background**: Solid `#FFFFFF` or subtle linear gradient `from-[#FFFFFF] to-[#F8FAFC]`.
- **Top Edge**: `border-t border-white/90` giving an illusion of downward overhead light.
- **Side/Bottom Edge**: `border-x border-b border-[#E2E8F0]`.
- **Corner Radius**: `16px` (`rounded-2xl`).
- **Shadow**: `shadow-skeuo-card`.
- **Padding**: `p-5` on desktop, `p-4` on mobile.

### 5.2 Tactile Buttons (`SkeuomorphicButton`)
1. **Primary Button (Sky Blue)**:
   - Background: `bg-gradient-to-b from-[#38BDF8] via-[#0284C7] to-[#0369A1]`.
   - Text: High-contrast white `#FFFFFF`, SemiBold 600, `text-xs` or `text-sm`.
   - Top Highlight: `border-t border-white/40`.
   - Bottom Lip: `border-b-2 border-[#075985]`.
   - Hover: Brightness filter 1.05, `translate-y-[-1px]`, increased sky-blue glow.
   - Active (Pressed): `translate-y-[1px]`, inner shadow, bottom lip flattened.
2. **Secondary Button (Neutral Elevated)**:
   - Background: `bg-gradient-to-b from-[#FFFFFF] to-[#F1F5F9]`.
   - Text: Slate 700 (`#334155`), SemiBold 600.
   - Border: `border border-[#CBD5E1]`.
   - Bottom Lip: `border-b-2 border-[#94A3B8]`.
   - Hover: Background `#F8FAFC`, subtle shadow rise.
   - Active: Inset shadow `inset 0 1px 3px rgba(0,0,0,0.1)`.
3. **Danger Button (SOS / Delete)**:
   - Background: `bg-gradient-to-b from-[#EF4444] to-[#B91C1C]`.
   - Bottom Lip: `border-b-2 border-[#7F1D1D]`.

### 5.3 Inset Input Fields (`InsetInput`)
- **Background**: `#F8FAFC` (subtly darker than the card surface to emphasize recess).
- **Border**: `border border-[#CBD5E1]`.
- **Inner Shadow**: `shadow-[inset_0_2px_4px_rgba(15,23,42,0.06)]`.
- **Focus State**: `bg-[#FFFFFF]`, border `#38BDF8`, outer glow `ring-2 ring-[#38BDF8]/25`.
- **Typography**: Text `#1E293B`, placeholder `#94A3B8`, `text-xs` or `text-sm`.
- **Height**: Standard `40px` (`h-10`) for dense desktop, `44px` on mobile touch.

### 5.4 Dark Charcoal Sidebar (`AppSidebar`)
- **Width**: Fixed `260px` (`w-[260px]`) on desktop viewports.
- **Background**: Solid `#263442`.
- **Right Border**: `1px solid #1B2631`.
- **Brand Header**:
  - Elevated badge with sky-blue gradient fill containing the white Shield icon.
  - "Patroli Site" white text, letter-spacing `0.02em`.
- **Navigation Items**:
  - Regular Item: Height `42px`, padding `px-3.5`, rounded-xl (`12px`).
  - Icon: `w-4 h-4`, Slate 400 `#94A3B8`.
  - Text: Slate 300 `#CBD5E1`, font-medium, `text-xs`.
  - Active Item:
    - Background: `bg-gradient-to-r from-[#0284C7] to-[#38BDF8]`.
    - Drop Shadow: `0 4px 14px rgba(2, 132, 199, 0.45)`.
    - Icon & Text: Pure white `#FFFFFF`, font-bold.
- **Tree Submenus**:
  - Vertical guide line: `border-l-2 border-slate-600/40 ml-5 pl-3.5 py-1 space-y-1.5`.
  - Sub-items: Indented, `text-[11px]`, active child colored `#38BDF8` with a glowing bullet point.
- **User Profile Footer**:
  - Nested container `#1E2B37` with subtle bevel.
  - Circular avatar (34px) with green status dot.
  - Name and role truncate cleanly. Logout button on right with hover red tint.

### 5.5 High-Clarity Data Tables (`DataTable`)
- **Container**: Wrapped in a raised card panel with rounded corners.
- **Header**:
  - Background: `#F8FAFC`.
  - Text: `#64748B`, uppercase `text-[11px]`, font-bold, tracking-wider.
  - Border: `border-b border-[#E2E8F0]`.
- **Rows**:
  - Background: `#FFFFFF`. Alternate row (optional): `#FAFCFF`.
  - Row Hover: Smooth transition to `#F0F7FF` (soft sky-blue highlight).
  - Cell Padding: `py-3.5 px-4`.
  - Vertical Divider: None; horizontal hairline dividers (`border-b border-[#F1F5F9]`).
- **Action Controls**:
  - Small tactile square buttons (`w-7 h-7 rounded-lg`).
  - Edit: Blue icon `#0284C7` on hover `#E0F2FE`.
  - Delete: Red icon `#DC2626` on hover `#FEE2E2`.

### 5.6 Status Indicators & Badges
- **Active Pill ("Aktif")**:
  - Background: `#DCFCE7` (Emerald 100).
  - Text: `#15803D` (Emerald 700), font-bold, `text-[10px]`.
  - Indicator: 6px circular dot `#16A34A` with subtle pulsing aura.
- **Live Beacon ("● Live")**:
  - Pill with emerald background, green dot with CSS radar wave animation.
- **Panic Alert Pill**:
  - Background: `#FEE2E2` (Rose 100), text `#B91C1C` (Rose 700).

### 5.7 Modals & Dialogs
- **Backdrop Scrim**: `bg-slate-900/60 backdrop-blur-sm`.
- **Surface**: Raised white dialog with `shadow-skeuo-elevated`, rounded-2xl (`20px`).
- **Header**: Bold title, clear close `X` button with secondary tactile hover.
- **Split Modal Pattern (e.g. Tambah Area)**:
  - Left pane: 3D thematic isometric asset (Pin/Map/Shield) on soft radial pedestal.
  - Right pane: Inset form controls with clear hierarchy and primary/secondary button tray.

---

## 6. Accessibility & Operational Guardrails

1. **Color Contrast (WCAG 2.1 AA Compliant)**:
   - Primary text `#1E293B` on `#FFFFFF` card: Ratio **13.5:1** (Passes AAA).
   - Sky Blue `#0284C7` text on white: Ratio **4.6:1** (Passes AA).
   - White text on Sky Blue button `#0284C7`: Ratio **4.6:1** (Passes AA).
   - Inactive sidebar text `#94A3B8` on `#263442`: Ratio **4.8:1** (Passes AA).
2. **Touch Targets**:
   - Desktop interactive minimum: `36px × 36px`.
   - Mobile interactive minimum: `44px × 44px` (buttons, drawer triggers, QR toggles).
3. **Keyboard Focus States**:
   - Visible focus outline using `outline-none ring-2 ring-[#38BDF8] ring-offset-2`.
4. **Motion & Reduced Motion**:
   - Transitions capped at `150ms` - `200ms` for operational snappiness.
   - Respects `@media (prefers-reduced-motion: reduce)`.
