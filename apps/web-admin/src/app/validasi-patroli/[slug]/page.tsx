'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function FieldSlugRedirectRoute() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  useEffect(() => {
    const target = slug ? `/pwa/${slug}` : '/pwa';
    window.location.href = target;
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-2" />
      <p className="text-xs text-slate-400">Mengarahkan ke modul lapangan PWA...</p>
    </div>
  );
}
