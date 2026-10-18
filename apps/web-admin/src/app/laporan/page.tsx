'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LaporanPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/laporan/security/anggota');
  }, [router]);

  return (
    <div className="w-full text-center py-12 text-slate-500 text-sm">
      <i className="fa fa-spinner fa-spin mr-2"></i>
      Mengarahkan ke Laporan Security Anggota...
    </div>
  );
}
