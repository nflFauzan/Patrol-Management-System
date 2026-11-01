import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <h2 className="text-2xl font-bold text-slate-800">404 - Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-slate-500">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

