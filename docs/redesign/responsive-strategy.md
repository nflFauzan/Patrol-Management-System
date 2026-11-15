# PATROLI SITE — RESPONSIVE DESIGN & MOBILE STRATEGY
> **Cross-Device Viewport Specifications, Breakpoints, and Operational Ergonomics**  
> Document Version: 1.0.0 — Target Monorepo: `Patrol-Management-System`

---

## 1. Viewport Framework & Breakpoint Hierarchy

The Patroli Site platform serves two contrasting operational realities:
1. **Desktop Command Center (1440px)**: Multi-window supervisory consoles operated with precision mouse/keyboard in air-conditioned control rooms.
2. **Field Operational Mobile (390px)**: Handheld smartphones operated with thumbs outdoors by guards, cleaners, and drivers under direct sunlight and high-stress situations.

```
[ SCREEN SIZE HIERARCHY ]
  Mobile (Field):        360px - 639px   (Reference Target: 390px iPhone/Android)
  Tablet (Supervisory):  640px - 1023px  (Reference Target: 768px iPad/Tablet)
  Desktop (Console):    1024px - 1440px+ (Reference Target: 1440px Wide Display)
```

| Breakpoint Key | Min Width | Max Width | Target Devices | Navigation Architecture | Key Layout Adaptation |
|---|---|---|---|---|---|
| **Mobile (`< sm`)** | `320px` | `639px` | iPhone 13/14/15 (390px), Samsung Galaxy (360-412px) | **Slide-out Drawer** (Triggered via compact header menu; **NO permanent bottom bar**). | Single column; 48px touch targets; stacked 2-grid stats; full-screen camera viewports. |
| **Tablet (`md`)** | `640px` | `1023px` | iPad Mini, iPad Air (768px), Galaxy Tab | Slide-out Drawer or docked icon rail. | 2-3 column dashboard grid; horizontal scroll data tables with sticky primary column. |
| **Desktop (`lg` - `xl`)** | `1024px` | `1439px` | Laptop displays (1280px, 1366px) | Fixed Left Sidebar (`260px`). | Standard 3-column dashboard; dual-column form modals with side illustrations. |
| **Wide Desktop (`2xl`)** | `1440px` | `2560px+` | Command Center monitors (1440px, 1080p, 4K) | Fixed Left Sidebar (`260px`). | 5-item stat card row; side-by-side interactive Leaflet map and activity timeline. |

---

## 2. Desktop Strategy (1440px Reference Viewport)

### 2.1 Layout Structure
- **Sidebar**: Fixed left docked rail (`w-[260px]`), solid charcoal `#263442`, height `100vh`, sticky top `0`.
- **Top Utility Bar**: Sticky top `0`, height `64px`, glassmorphic white `#FFFFFF/90`, border-b `border-slate-200/80`.
  - Recessed search input pill (`w-96`) with placeholder `"Cari nama, site, atau laporan..."`.
  - Live system status indicators: `"Sistem Siaga"` (green pulsing dot) and current shift schedule pill.
  - Notification bell with red badge counter (`3`).
  - User summary pill with circular avatar (36px), full name, corporate title, and dropdown chevron.
- **Main Canvas Grid**:
  - Max width container: `max-w-[1400px] mx-auto p-6`.
  - **Row 1**: Sweeping Hero Welcome Banner with officer silhouette, greeting headline, and WIB live digital clock.
  - **Row 2**: 5-column metric stat row (`grid-cols-5 gap-4`):
    - Total Personel (124) | Total Area (12) | Total Site (48) | Absensi Hari Ini (96%) | Patroli Aktif (7).
  - **Row 3**: 3-column Bento operational split (`grid-cols-12 gap-5`):
    - Col 1-4 (33%): **Aktivitas Patroli** (Interactive line chart with hourly nodes 06:00 to 16:00).
    - Col 5-8 (33%): **Peta Lokasi Patroli** (Interactive Leaflet map with Live status pill, waypoint lines, central hub shield).
    - Col 9-12 (33%): **Notifikasi Terbaru** (Chronological feed with colored category icon wells).

### 2.2 Desktop Form & Table Ergonomics
- Tables display all primary data columns (Photo, Name, NIK, Area, Status, Actions) without horizontal truncation.
- Modals utilize a dual-pane split: Left pane displays an isometric 3D theme graphic (Pin/Map/Shield); right pane houses inset input controls.

---

## 3. Tablet Strategy (768px Reference Viewport)

### 3.1 Layout Adaptations
- **Sidebar**: Hidden by default to maximize operational canvas; opens as an overlay drawer when the hamburger menu is tapped.
- **Header**: Search well condenses from a fixed 384px to an expanding search icon or compact 200px field.
- **Dashboard Grid**:
  - Stat cards reconfigure into a 3 + 2 layout: 3 cards in row 1, 2 cards in row 2.
  - The 3 bottom panels (Chart, Map, Notifications) collapse into a 2-column or stacked layout:
    - Row 1: Line Chart (50%) + Map Preview (50%).
    - Row 2: Full-width Notifications Feed (100%).
- **Data Tables**:
  - Horizontal swipe enabled with a subtle right-edge fade indicator.
  - Primary identification column (Officer Name / Site Name) is made sticky (`sticky left-0 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.04)]`) so row identity is never lost during horizontal panning.

---

## 4. Mobile Strategy (390px Reference Viewport)

The mobile experience is **designed independently** for field workers, NOT merely as a shrunk desktop screen.

### 4.1 Strict Navigation Rule: Slide-Out Drawer
- **NO Permanent Bottom Navigation Bar**: Per strict architectural directive, a permanent bottom tab bar is prohibited. Bottom bars consume valuable vertical viewport height, accidentally trigger during one-handed thumb scanning, and clutter operational flows.
- **Header Navigation Bar**:
  - Height: `56px`.
  - Left: Compact hamburger menu button (`44px × 44px` touch target) triggering the slide-out drawer.
  - Center: Brand title `"Patroli Site"` with shield logo badge.
  - Right: Notification bell icon with unread badge dot.
- **Slide-Out Drawer (`MobileNavigationDrawer`)**:
  - Full height (`100vh`), width `300px` (or `85vw` on very small screens).
  - Background: Dark charcoal `#263442` matching desktop sidebar.
  - User profile badge at top with avatar, name, and division tag.
  - Role-specific navigation items organized into clean vertical touch rows (min height `48px`).
  - Pinned bottom action: High-urgency red **"PANIC BUTTON SOS"** button.

### 4.2 Mobile Operational Workflows

1. **Dashboard Overview**:
   - Greeting card: `"Selamat Pagi, [Name] 👋"` + current date and time.
   - 4-grid compact metric cards (`grid-cols-2 gap-3`): Personel, Area, Site, Absensi.
   - Large full-width actionable banner: **`Patroli Aktif: [X] Personel ➔`**.
   - Chronological vertical feed of recent operational activities.

2. **Absen Masuk & Pulang (Clock-In / Clock-Out)**:
   - Top status card: Real-time GPS geofence indicator (Green badge: `"Dalam Radius (12m)"` vs Red: `"Di Luar Radius"`).
   - Camera viewport: Elevated card with front camera selfie streaming, face oval positioning guide, and real-time timestamp/GPS watermark overlay.
   - Single prominent tactile button: Full-width, height `52px`, green gradient for Clock-In, amber for Clock-Out.

3. **QR Checkpoint Patrol Scanning (`PatrolScanPage`)**:
   - Full-viewport camera viewfinder overlay using `html5-qrcode`.
   - White corner brackets with 12px rounded edges framing the target area.
   - Animated laser scan line moving vertically.
   - Bottom floating camera control bar:
     - Flashlight toggle button (`48px × 48px`).
     - Camera flip button (`48px × 48px`).
     - Cancel / Back button.
   - On successful scan: Instant haptic vibration (if supported) + bottom confirmation sheet displaying checkpoint name, scanned time, and status condition selector ("Normal" vs "Abnormal").

4. **Panic Button SOS (`PanicPage`)**:
   - Giant circular 3D tactile red SOS button centered on the screen (diameter `160px`).
   - Outer pulsating concentric radar rings.
   - **3-Second Hold Mechanism**: Guard must hold the button down for 3 seconds to prevent accidental false alarms. A circular progress ring fills up during the hold.
   - Immediate feedback upon release: Full-screen emergency state with siren sound and GPS dispatch status.

5. **Driver Trip Logging (`DriverTripPage`)**:
   - Step 1: Vehicle & Route selection dropdowns.
   - Step 2: Camera capture button specifically labeled for Odometer Dashboard snapshot.
   - Step 3: Numeric keypad for exact odometer KM entry.
   - Step 4: Big tactile button: `"CATAT KEBERANGKATAN"` or `"CATAT KEDATANGAN"`.

6. **Cleaning Checklist (`StaffActivityPage` / Sanitation)**:
   - Zone cards with toggle checkboxes (Wastafel, Kloset, Cermin, Lantai).
   - "Ambil Foto Bukti" button opening the camera.
   - Big tactile submit button.

---

## 5. Mobile Ergonomics & Operational Safeguards

| Ergonomic Factor | Mobile Requirement | Safeguard Implementation |
|---|---|---|
| **Touch Target Size** | All interactive elements must measure at least `44px × 44px`. | Strict padding on buttons (`py-3.5 px-4`), inputs (`h-12`), and drawer links (`h-12`). |
| **Outdoor Sunlight Contrast** | High ambient glare reduces screen contrast. | Pure white cards (`#FFFFFF`) against cool light gray (`#E5E9EE`); bold text `#1E293B`; vivid Sky Blue `#0284C7`. |
| **One-Handed Thumb Reach** | Primary actions placed in the bottom "thumb zone". | Primary CTAs (Clock-In, Submit, Scan) positioned at the bottom of the viewport; destructive actions guarded. |
| **Accidental Dismissal** | Guards accidentally tapping outside modals. | Critical operational modals (Clock-In, SOS, QR Scan) disable backdrop tap-to-dismiss (`closeOnBackdropClick = false`). |
| **Camera & Geolocation Permissions** | Browser prompts blocked or denied. | Explicit pre-flight permission helper cards with clear step-by-step instructions on how to enable GPS/Camera in settings. |
| **Network Flakiness / Offline** | Guards in underground basements or dead zones. | Workbox Service Worker caching; local IndexedDB queueing for scanned checkpoints with automatic sync upon reconnect. |
