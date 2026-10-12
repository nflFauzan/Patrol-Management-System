'use client';

import React from 'react';
import { DataProvider } from '../lib/DataContext';
import { Navbar } from './Navbar';
import { GlobalModals } from './GlobalModals';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DataProvider>
      <Navbar />
      <main className="max-w-[1440px] mx-auto p-4 lg:p-6">
        {children}
      </main>
      <GlobalModals />
    </DataProvider>
  );
};
