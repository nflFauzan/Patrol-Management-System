'use client';

import React from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-lg font-bold text-red-600 mb-2">Terjadi kesalahan</h2>
      <p className="text-sm text-gray-600 mb-4">{error?.message || 'Error tidak terduga'}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-semibold"
      >
        Coba Lagi
      </button>
    </div>
  );
}
