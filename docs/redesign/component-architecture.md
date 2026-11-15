# PATROLI SITE — COMPONENT ARCHITECTURE SPECIFICATION
> **Modular, Reusable Design System Component Hierarchy & Shared Layout Architecture**  
> Document Version: 1.0.0 — Target Monorepo: `Patrol-Management-System`

---

## 1. Architectural Strategy & Design System Principles

To eliminate visual fragmentation across `apps/web-admin` and `apps/pwa-field`, the UI architecture must transition from ad-hoc inline styling to a **shared, headless-ready component hierarchy** grounded in Modern Skeuomorphism tokens.

### Core Architectural Decisions:
1. **Single Source of Tokens**: All skeuomorphic shadows, borders, highlights, and colors reside in Tailwind configuration and CSS variable layers. Components consume semantic class names (`shadow-skeuo-card`, `bg-sidebar-base`, `text-primary-blue`).
2. **Preserve Business State & Contracts**: Components remain purely presentational or thin state wrappers. Existing context hooks (`useAuth()`, `useData()`), API services, and WebSocket listeners remain unchanged.
3. **Dual Form-Factor Adaptation**: Components automatically adjust between desktop mouse precision (36px inputs, hover elevations) and mobile finger touch (44-48px touch targets, active pressed states).
4. **No Premature Abstraction**: Shared components are designed with clear variant props (`variant="primary" | "secondary" | "danger"`) rather than complex polymorphic abstractions.

---

## 2. Component Hierarchy & Organization

```
apps/web-admin/src/components/
├── ui/                                    <-- Atomic Design Foundation
│   ├── SurfaceCard.tsx                    <-- Raised skeuomorphic card container
│   ├── SkeuomorphicButton.tsx             <-- Tactile button (Primary Sky Blue, Secondary, Danger)
│   ├── InsetInput.tsx                     <-- Recessed input with inner shadow
│   ├── SearchInput.tsx                    <-- Inset pill search well with magnifying icon
│   ├── StatusBadge.tsx                    <-- Status pill with animated pulsing dot
│   ├── UserAvatar.tsx                     <-- Avatar with online status dot and initials fallback
│   ├── DataTable.tsx                      <-- Unified data table with hover, sort, and pagination
│   ├── ModalDialog.tsx                    <-- Backdrop blur modal with split illustration support
│   ├── ConfirmDialog.tsx                  <-- Action confirmation dialog (Delete, Acknowledge)
│   ├── EmptyState.tsx                     <-- Tactile empty state with icon receptacle
│   ├── LoadingState.tsx                   <-- Pulsing shield loading state
│   └── ErrorState.tsx                     <-- Tactical error banner with retry CTA
│
├── layout/                                <-- Shell & Navigation Architecture
│   ├── AppLayout.tsx                      <-- Top-level shell with dual-rail sidebar & header
│   ├── AppSidebar.tsx                     <-- Dark charcoal sidebar (#263442) with tree submenus
│   ├── AppHeader.tsx                      <-- Top utility bar with search, bell, and user profile
│   ├── MobileNavigationDrawer.tsx         <-- Slide-out mobile drawer with role-specific navigation
│   ├── PageHeader.tsx                     <-- Page title, breadcrumb trail, and action slots
│   └── Breadcrumbs.tsx                    <-- Domain > Module > Subpage navigational trail
│
├── operational/                           <-- Specialized Operational Widgets
│   ├── DashboardStatCard.tsx              <-- 5-metric card with circular icon and trend pill
│   ├── DashboardActivityChart.tsx         <-- Line chart preview with time tooltips
│   ├── DashboardMapPreview.tsx            <-- Interactive Leaflet map with Live status pill
│   ├── NotificationPanel.tsx              <-- Dropdown notification feed with category icons
│   ├── PanicAlertModal.tsx                <-- 3D siren emergency beacon dialog
│   ├── QRScannerViewfinder.tsx            <-- Viewfinder frame with laser line and camera toggles
│   └── SelfieCameraViewport.tsx           <-- Front camera frame with face guide and watermark
│
└── views/                                 <-- Domain-Specific Module Views
    ├── AreaManagementView.tsx
    ├── CheckpointManagementView.tsx
    ├── PersonilManagementView.tsx
    ├── ApprovalQueueView.tsx
    ├── AttendanceMonitoringView.tsx
    ├── PayrollView.tsx
    └── BroadcastView.tsx
```

---

## 3. Core Component Specifications

### 3.1 `SurfaceCard`
- **Purpose**: Base container for all panels, metric boxes, data tables, and modal contents.
- **Props**:
  - `variant?: 'elevated' | 'inset' | 'flat' | 'interactive'` (default: `'elevated'`)
  - `padding?: 'none' | 'sm' | 'md' | 'lg'` (default: `'md'`)
  - `className?: string`
- **Visual Treatment**:
  - `elevated`: `bg-white rounded-2xl shadow-skeuo-card border border-slate-200/80 border-t-white/90`.
  - `inset`: `bg-slate-50/80 rounded-xl shadow-skeuo-inset border border-slate-200/80`.
  - `interactive`: Adds hover `translate-y-[-2px]` and cursor pointer.

### 3.2 `SkeuomorphicButton`
- **Purpose**: Primary interactive element across all forms, modals, and actions.
- **Props**:
  - `variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon'` (default: `'primary'`)
  - `size?: 'sm' | 'md' | 'lg'` (default: `'md'`)
  - `isLoading?: boolean`
  - `icon?: LucideIcon`
  - `disabled?: boolean`
- **States & Variants**:
  - **`primary`**: Deep Sky Blue gradient (`from-[#38BDF8] via-[#0284C7] to-[#0369A1]`), white text, 1px top highlight, 2px bottom lip (`border-b-2 border-[#075985]`). Active: `translate-y-[1px]`, inner shadow.
  - **`secondary`**: Off-white gradient, slate-700 text, 1px bottom lip (`border-b-2 border-slate-300`).
  - **`danger`**: Crimson gradient (`from-[#EF4444] to-[#B91C1C]`), white text, 2px darker bottom lip.
  - **`icon`**: Square button (`w-8 h-8 rounded-lg`) for table actions (Edit, Delete, Print).

### 3.3 `InsetInput` & `SearchInput`
- **Purpose**: Recessed text inputs, select dropdowns, and search wells that give physical depth.
- **Props**:
  - `icon?: LucideIcon`
  - `error?: string`
  - `helperText?: string`
  - Standard HTML input / select / textarea attributes.
- **Visual Treatment**:
  - Recessed well: `bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800`.
  - Inset shadow: `shadow-[inset_0_2px_4px_rgba(15,23,42,0.06)]`.
  - Focus state: `bg-white border-[#38BDF8] ring-2 ring-[#38BDF8]/20 outline-none`.
  - Error state: `border-red-400 bg-red-50/30 focus:ring-red-300`.

### 3.4 `AppSidebar` (Desktop Navigation)
- **Purpose**: Left-docked dark charcoal navigation rail.
- **Internal Composition**:
  - **Brand Header**: Shield icon in a raised sky-blue square + "Patroli Site" white heading.
  - **Navigation List**: Grouped by domain (OPERASIONAL, DATA INDUK, REKAP & LAPORAN).
  - **Expandable Subtree (`TreeSubmenu`)**: Indented children with vertical guide line (`border-l border-slate-600/50`).
  - **Active State**: Raised Sky Blue gradient pill (`from-[#0284C7] to-[#38BDF8]`) with white icon and drop shadow glow.
  - **User Profile Footer**: Recessed card (`#1E2B37`) with circular avatar, user name, role, and quick logout button.

### 3.5 `MobileNavigationDrawer`
- **Purpose**: Replaces outdated kiosk buttons with an on-demand slide-out drawer on viewports `<1024px`.
- **Behavior**:
  - Triggered by a compact header menu button (3-line hamburger icon).
  - Smooth slide-out from left with `bg-slate-900/60 backdrop-blur-sm` backdrop scrim.
  - Drawer canvas uses `#263442` identical to the desktop sidebar for 100% brand consistency.
  - Dynamically renders role-specific links based on `user.role` and `user.permissions`.
  - Dedicated tactile **"PANIC BUTTON SOS"** badge pinned at the bottom of the drawer.

### 3.6 `DashboardStatCard`
- **Purpose**: Presents the 5 primary operational metrics on both desktop and mobile.
- **Props**:
  - `title: string` (e.g. "Total Personel", "Patroli Aktif")
  - `value: number | string` (e.g. `124`, `7`)
  - `subtext?: string` (e.g. "Dalam Bertugas")
  - `trend?: { direction: 'up' | 'down' | 'neutral'; text: string }`
  - `icon: LucideIcon`
  - `accentColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan'`
- **Visual Treatment**:
  - Raised white surface card (`shadow-skeuo-card`).
  - Circular icon receptacle (44px) with soft 12% tint background.
  - Bold tabular metric typography (`text-2xl font-bold text-slate-900`).
  - Trend badge pill (`bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full`).

### 3.7 `DataTable`
- **Purpose**: Standardized, high-density table container for Area, Checkpoints, Personnel, Attendance, and Activity logs.
- **Features**:
  - Clean white card wrapper with top action toolbar (Search input, dropdown filter, primary action CTA).
  - Sticky table header with subtle uppercase slate labels.
  - Alternating row highlight and smooth hover transition (`hover:bg-[#F0F7FF]`).
  - Column alignment props (left for text, center for badges/photos, right for currency/actions).
  - Integrated pagination footer (`Menampilkan X-Y dari Z data`, previous/next icon pills).

### 3.8 `PanicAlertModal`
- **Purpose**: High-urgency alert modal triggered by WebSocket `sos:new` event or manual preview.
- **Features**:
  - Crimson top alert bar with warning icon and "Panic Alert" label.
  - 3D red emergency beacon illustration with pulsating CSS radial radar waves.
  - High-visibility text: "Peringatan Darurat!" + Site name, time WIB, and reporting officer name.
  - Dual action tray: "Acknowledge" (tactile Sky Blue CTA) and "Tutup" (tactile secondary outline).

### 3.9 `QRScannerViewfinder`
- **Purpose**: Professional camera scanner overlay for field security checkpoint rounds.
- **Features**:
  - Full-screen or elevated card video feed using `html5-qrcode`.
  - Crisp white corner guide brackets with 12px border radius.
  - Smooth animated horizontal laser scan line.
  - Bottom tactile utility bar: Flashlight on/off toggle, flip camera, abort scan.
  - Immediate audio-haptic feedback and visual checkmark card upon successful decode.

---

## 4. Shared Layout Architecture

```
[ Root Shell: AppLayout ]
  ├── [ Fixed Left Sidebar: AppSidebar ] (Hidden on mobile <1024px)
  │     ├── Brand Banner & Logo
  │     ├── Scrollable Nav Groups (Operasional, Data Induk, Laporan)
  │     └── User Profile Footer Card
  │
  └── [ Main Viewport: Content Canvas ]
        ├── [ Sticky Header: AppHeader ]
        │     ├── Mobile Drawer Trigger (Mobile only)
        │     ├── Inset Search Well (Desktop)
        │     ├── Live Status Pills (Sistem Siaga, Shift Active)
        │     ├── Notification Bell with Badge Counter
        │     └── User Profile Dropdown Pill
        │
        ├── [ Main Scroll Container: main ]
        │     ├── PageHeader & Breadcrumbs
        │     └── [ Dynamic Route View ]
        │
        └── [ Global Overlay Portals ]
              ├── MobileNavigationDrawer (Mobile only)
              ├── PanicAlertModal (WebSocket triggered)
              └── Toast Notifications
```
