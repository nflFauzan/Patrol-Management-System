import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Patrol Management System - Enterprise Command Center',
  description: 'Enterprise In-House Security, Cleaning & Fleet Facility Operations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
