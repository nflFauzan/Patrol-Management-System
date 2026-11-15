# PATROLI SITE — REDESIGN RISK REGISTER & MITIGATION MATRIX
> **Identification of Technical, Operational, Visual, and Security Regression Risks with Concrete Mitigations**  
> Document Version: 1.0.0 — Target Monorepo: `Patrol-Management-System`

---

## 1. Risk Evaluation Framework

Risks are scored using standard enterprise severity metrics:
- **Severity**: Low (1) ➔ Critical (5)
- **Likelihood**: Rare (1) ➔ Highly Probable (5)
- **Risk Score**: $\text{Severity} \times \text{Likelihood}$ (1 to 25)

```
[ RISK SEVERITY MATRIX ]
  20 - 25: Critical Block (Must mitigate before code execution)
  12 - 19: High Risk (Requires dedicated automated test gate)
   6 - 11: Medium Risk (Requires architectural guardrail)
   1 - 5:  Low Risk (Standard code review & QA)
```

---

## 2. Risk Register Matrix

| Risk ID | Risk Domain & Description | Potential Impact | Severity (1-5) | Likelihood (1-5) | Score | Concrete Technical Mitigation & Safety Net |
|---|---|---|---|---|---|---|
| **RSK-01** | **Leaflet Map z-index & Stacking Context Clashes**: Elevated skeuomorphic cards and sticky headers might bleed under or over Leaflet map canvas tiles (`.leaflet-pane` defaults to `z-index: 400`). | Dropdown menus, modal dialogs, or mobile drawers render behind map tiles or get clipped. | 4 | 4 | **16 (High)** | Enforce strict z-index scale in Tailwind: `z-base: 0`, `z-card: 10`, `z-header: 20`, `z-sidebar: 30`, `z-drawer: 40`, `z-modal: 50`, `z-toast: 60`. Set Leaflet map container to `isolate relative z-0` so tile panes never leak into the root stacking context. |
| **RSK-02** | **Accidental Panic SOS False Alarms on Mobile**: Redesigning the mobile panic button could make it too easy to accidentally tap while handling the phone during patrol rounds. | Police or management alerted needlessly; WhatsApp broadcast spam; guard penalties. | 5 | 3 | **15 (High)** | Implement strict **3-Second Hold-to-Trigger** interaction. A continuous press animation fills a circular SVG progress track; releasing before 3.0s cancels the trigger immediately. |
| **RSK-03** | **Camera Stream Locking & Black Screen on Mobile Viewport Changes**: Modifying the camera preview container or switching between selfie/environment cameras in PWA can leak `MediaStream` tracks. | Camera fails to open; black box on Clock-In or QR scanning; guards unable to record attendance. | 5 | 3 | **15 (High)** | Standardize camera cleanup in a `useEffect` return handler: always call `stream.getTracks().forEach(track => track.stop())`. Implement explicit error boundaries with a "Reset Kamera" tactile button. |
| **RSK-04** | **Role & Permission Leaks to Non-Admin Users**: Reorganizing the navigation hierarchy could accidentally expose Master Data (Area, Checkpoints, RBAC, Payroll) to field guards or cleaners. | Critical data breach; unauthorized editing of checkpoints or salary parameters. | 5 | 2 | **10 (Med)** | Guard navigation rendering at both **UI Level** (`user.role === 'ADMIN_SUPER' || hasPermission(...)`) and **Next.js Middleware Level** (`middleware.ts`). Non-authorized route access triggers automatic redirect to `/login` or `/field`. |
| **RSK-05** | **Duplicated Field App Code Drift (`web-admin/src/field` vs `pwa-field`)**: The repository currently maintains two copies of field pages. Updating only one creates silent divergence bugs. | Features work in admin simulation but fail in live PWA on real phones, or vice versa. | 4 | 4 | **16 (High)** | Document clear file parity synchronization in Phase 7-10. Verify both entry points during E2E testing. (Long-term: extract field pages into a shared package `@patrol/field-ui`). |
| **RSK-06** | **Watermark Timestamp & GPS Precision Drift**: Redesigning the camera capture canvas could alter font scaling, coordinate string formatting, or aspect ratio of the burned tamper-proof watermark. | Disputed attendance evidence; invalid audit logs for HRIS payroll processing. | 4 | 2 | **8 (Med)** | Retain the exact existing `watermark.ts` canvas drawing routine without modifying font rendering logic, coordinate formatting, or UTC+7 timestamp math. |
| **RSK-07** | **Outdoor Sunlight Unreadability (Low Contrast)**: Soft skeuomorphic shadows or subtle gray tones might wash out on low-tier smartphones outdoors at 12:00 PM. | Guards cannot read checkpoint instructions or task descriptions during daytime rounds. | 4 | 3 | **12 (High)** | Strictly enforce high-contrast text tokens: Slate 900 (`#0F172A`) for primary body and labels (contrast ratio > 13:1 on white cards); avoid low-contrast gray text on interactive surfaces. |
| **RSK-08** | **Gloved Hands & Small Touch Target Misses**: Field guards wearing tactical gloves or cleaners with wet hands missing touch buttons. | Frustration, slow operational throughput, missed patrol checkpoints. | 3 | 4 | **12 (High)** | All mobile interactive elements must strictly adhere to a **48px minimum hit target** (`min-h-[48px] min-w-[48px]`) with generous padding. |
| **RSK-09** | **WebSocket Disconnection Drops During Emergency Alerts**: UI redesign altering context providers could inadvertently unmount Socket.io connections. | Command center misses incoming real-time Panic SOS or checkpoint scan updates. | 5 | 2 | **10 (Med)** | Keep `DataProvider` and `AuthContext` outside of page transition boundaries in `AppProviders.tsx`; maintain socket reconnection backoff logic intact. |
| **RSK-10** | **Horizontal Viewport Overflow on Small Screens (320px - 390px)**: Large tables or fixed-width containers causing awkward side-scrolling on mobile devices. | Distorted layout; unusable mobile interface; failed PWA certification. | 3 | 3 | **9 (Med)** | Set global `overflow-x: hidden` on root shells; wrap all data tables in dedicated horizontal scrolling wrappers with sticky identifier columns. |
