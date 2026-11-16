import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClockInPage } from './pages/ClockInPage';
import { ClockOutPage } from './pages/ClockOutPage';
import { LeavePage } from './pages/LeavePage';
import { AttendanceHistoryPage } from './pages/AttendanceHistoryPage';
import { ActivityHistoryPage } from './pages/ActivityHistoryPage';
import { PanicPage } from './pages/PanicPage';
import { ProfilePage } from './pages/ProfilePage';
import { PatrolScanPage } from './pages/PatrolScanPage';
import { DriverTripPage } from './pages/DriverTripPage';
import { CommanderReportPage } from './pages/CommanderReportPage';
import { ChiefReportPage } from './pages/ChiefReportPage';
import { StaffActivityPage } from './pages/StaffActivityPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login.php" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirects */}
          <Route path="/" element={<Navigate to="/validasi-patroli/" replace />} />

          {/* Protected Operational Field Routes */}
          <Route
            path="/validasi-patroli"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/index.php"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Individual Module Pages */}
          <Route
            path="/validasi-patroli/xxxxx_xx.php"
            element={
              <ProtectedRoute>
                <ClockInPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/xxxxx_xxx.php"
            element={
              <ProtectedRoute>
                <ClockOutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/xxxxx_xxxx.php"
            element={
              <ProtectedRoute>
                <LeavePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/xxxxx_xxxxx.php"
            element={
              <ProtectedRoute>
                <AttendanceHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/xxxxx_xxxxxx.php"
            element={
              <ProtectedRoute>
                <ActivityHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/xxxxx_xxxxxxx.php"
            element={
              <ProtectedRoute>
                <PanicPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/xxxxx_xxxxxxxx.php"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/xxxxx_xxxxxxxxx.php"
            element={
              <ProtectedRoute requiredPermission="PATROL:VALIDATE">
                <PatrolScanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/xxxxx_xxxxxxxxxx.php"
            element={
              <ProtectedRoute requiredPermission="DRIVER:MONITOR">
                <DriverTripPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/xxxxx_xxxxxxxxxxxx.php"
            element={
              <ProtectedRoute>
                <CommanderReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/xxxxx_xxxxxxxxxxxxx.php"
            element={
              <ProtectedRoute>
                <ChiefReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validasi-patroli/xxxxx_xxxxxxxxxxxxxx.php"
            element={
              <ProtectedRoute>
                <StaffActivityPage />
              </ProtectedRoute>
            }
          />

          {/* Legacy root alias routes */}
          <Route
            path="/xxxxx_xx.php"
            element={
              <ProtectedRoute>
                <ClockInPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/xxxxx_xxx.php"
            element={
              <ProtectedRoute>
                <ClockOutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/xxxxx_xxxx.php"
            element={
              <ProtectedRoute>
                <LeavePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/xxxxx_xxxxx.php"
            element={
              <ProtectedRoute>
                <AttendanceHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/xxxxx_xxxxxx.php"
            element={
              <ProtectedRoute>
                <ActivityHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/xxxxx_xxxxxxx.php"
            element={
              <ProtectedRoute>
                <PanicPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/xxxxx_xxxxxxxx.php"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/xxxxx_xxxxxxxxx.php"
            element={
              <ProtectedRoute requiredPermission="PATROL:VALIDATE">
                <PatrolScanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/xxxxx_xxxxxxxxxx.php"
            element={
              <ProtectedRoute requiredPermission="DRIVER:MONITOR">
                <DriverTripPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/xxxxx_xxxxxxxxxxxx.php"
            element={
              <ProtectedRoute>
                <CommanderReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/xxxxx_xxxxxxxxxxxxx.php"
            element={
              <ProtectedRoute>
                <ChiefReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/xxxxx_xxxxxxxxxxxxxx.php"
            element={
              <ProtectedRoute>
                <StaffActivityPage />
              </ProtectedRoute>
            }
          />

          {/* Canonical Semantic Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/clock-in" element={<ProtectedRoute><ClockInPage /></ProtectedRoute>} />
          <Route path="/clock-out" element={<ProtectedRoute><ClockOutPage /></ProtectedRoute>} />
          <Route path="/leave" element={<ProtectedRoute><LeavePage /></ProtectedRoute>} />
          <Route path="/attendance-history" element={<ProtectedRoute><AttendanceHistoryPage /></ProtectedRoute>} />
          <Route path="/activity-history" element={<ProtectedRoute><ActivityHistoryPage /></ProtectedRoute>} />
          <Route path="/panic" element={<ProtectedRoute><PanicPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/patrol-scan" element={<ProtectedRoute requiredPermission="PATROL:VALIDATE"><PatrolScanPage /></ProtectedRoute>} />
          <Route path="/driver-trip" element={<ProtectedRoute requiredPermission="DRIVER:MONITOR"><DriverTripPage /></ProtectedRoute>} />
          <Route path="/commander-report" element={<ProtectedRoute><CommanderReportPage /></ProtectedRoute>} />
          <Route path="/chief-report" element={<ProtectedRoute><ChiefReportPage /></ProtectedRoute>} />
          <Route path="/staff-activity" element={<ProtectedRoute><StaffActivityPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/validasi-patroli/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
