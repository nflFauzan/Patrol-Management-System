'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { DashboardPage } from '../../../field/pages/DashboardPage';
import { ClockInPage } from '../../../field/pages/ClockInPage';
import { ClockOutPage } from '../../../field/pages/ClockOutPage';
import { LeavePage } from '../../../field/pages/LeavePage';
import { AttendanceHistoryPage } from '../../../field/pages/AttendanceHistoryPage';
import { ActivityHistoryPage } from '../../../field/pages/ActivityHistoryPage';
import { PanicPage } from '../../../field/pages/PanicPage';
import { ProfilePage } from '../../../field/pages/ProfilePage';
import { PatrolScanPage } from '../../../field/pages/PatrolScanPage';
import { DriverTripPage } from '../../../field/pages/DriverTripPage';
import { CommanderReportPage } from '../../../field/pages/CommanderReportPage';
import { ChiefReportPage } from '../../../field/pages/ChiefReportPage';
import { StaffActivityPage } from '../../../field/pages/StaffActivityPage';

export default function FieldSlugRoute() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  switch (slug) {
    case 'xxxxx_xx.php':
    case 'clock-in':
      return <ClockInPage />;

    case 'xxxxx_xxx.php':
    case 'clock-out':
      return <ClockOutPage />;

    case 'xxxxx_xxxx.php':
    case 'leave':
      return <LeavePage />;

    case 'xxxxx_xxxxx.php':
    case 'attendance-history':
      return <AttendanceHistoryPage />;

    case 'xxxxx_xxxxxx.php':
    case 'activity-history':
      return <ActivityHistoryPage />;

    case 'xxxxx_xxxxxxx.php':
    case 'panic':
      return <PanicPage />;

    case 'xxxxx_xxxxxxxx.php':
    case 'profile':
      return <ProfilePage />;

    case 'xxxxx_xxxxxxxxx.php':
    case 'patrol-scan':
      return <PatrolScanPage />;

    case 'xxxxx_xxxxxxxxxx.php':
    case 'driver-trip':
      return <DriverTripPage />;

    case 'xxxxx_xxxxxxxxxxxx.php':
    case 'commander-report':
      return <CommanderReportPage />;

    case 'xxxxx_xxxxxxxxxxxxx.php':
    case 'chief-report':
      return <ChiefReportPage />;

    case 'xxxxx_xxxxxxxxxxxxxx.php':
    case 'staff-activity':
      return <StaffActivityPage />;

    case 'index.php':
    default:
      return <DashboardPage />;
  }
}

