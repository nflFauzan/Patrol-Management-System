# Known Issues, Limitations & Future Considerations
> **Patrol & Facility Management System (Enterprise In-House)**  
> Technical documentation of deliberate design constraints, non-blocking limitations, and future optimization paths.

---

## 1. Architectural Constraints & Non-Issues

### A. Single-Tenant In-House Enterprise Architecture
- **Design Decision**: The system deliberately omits `tenant_id` and multi-organization partitioning.
- **Rationale**: Built exclusively for a single corporate buyer (Beli Putus). Enterprise hierarchy is modeled as:
  `Corporate Headquarters ➔ Site / Facility ➔ Division ➔ Checkpoint`. Adding SaaS multi-tenancy would introduce unnecessary query overhead and security boundary complexity.

### B. Two Dedicated Frontend Frameworks
- **Design Decision**: `apps/web-admin` uses Next.js 14 App Router, while `apps/pwa-field` uses Vite 5 + React 18 SPA.
- **Rationale**:
  - The Web Admin Command Center benefits from server-rendered metadata, desktop layouts, and reporting exports.
  - The Field PWA requires lightweight, standalone offline caching (Workbox, IndexedDB) without Next.js server-side hydration overhead on low-end Android mobile devices in underground or remote basements.
  - Both applications are served behind a unified reverse proxy gateway on port 8080.

---

## 2. Operational Limitations & Edge Cases

### A. Geofence Accuracy on Low-End Hardware
- **Limitation**: In indoor environments (e.g. underground parking lots or concrete stairwells), mobile GPS accuracy may drift by 15–30 meters.
- **Mitigation**: The system supports configurable `geofence_radius_meters` per site (recommended 50m to 100m for complex facilities) and logs `clock_in_distance_meters` for administrative audit.

### B. Camera Permission Restrictions on Mobile Browsers
- **Limitation**: Self-signed SSL certificates in development may require users to click "Advanced -> Proceed" once to permit camera and geolocation access on mobile Chrome.
- **Mitigation**: Production environments MUST deploy trusted SSL/TLS certificates (e.g. Let's Encrypt or corporate internal CA) so WebRTC `MediaDevices.getUserMedia()` and Geolocation APIs function without browser warnings.

### C. IndexedDB Storage Quotas
- **Limitation**: Mobile browsers enforce storage quotas per origin on IndexedDB. Storing dozens of uncompressed base64 images offline could consume substantial storage over time.
- **Mitigation**: Photos are compressed before offline storage, and synced transactions are automatically purged after 7 days (`clearOldSyncedTransactions(7)`).

---

## 3. Recommended Future Roadmap

1. **Hardware Bluetooth Beacon / NFC Integration**:
   - Supplement QR code checkpoints with Bluetooth Low Energy (BLE) beacons or NFC tags for zero-light verification in pitch-dark industrial corridors.
2. **Automated PDF Report Generator Background Worker**:
   - Offload heavy monthly payroll and attendance PDF generation to a BullMQ worker thread to conserve HTTP event loop cycles during peak shift changes.
