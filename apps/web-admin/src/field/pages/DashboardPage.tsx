'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from '../utils/navigation';
import { Division, Attendance } from '@patrol/types';
import { attendanceApi } from '../services/api';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // User Profile
  const [userProfile, setUserProfile] = useState({
    id: '1447',
    fullName: 'HENDRA CHIEF',
    username: 'hendra.chief',
    role: 'CHIEF',
    division: 'SECURITY',
    badgeNumber: 'NIK-SEC-1447',
    rank: 'CHIEF',
  });

  const [activeAttendance, setActiveAttendance] = useState<Attendance | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Show Info Modal initially matching patroli.site #modalPanduanAwal
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInfoModalOpen(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Check today's attendance status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const todayData = await attendanceApi.getTodayStatus();
        if (todayData && todayData.clockInTime) {
          setActiveAttendance(todayData);
        }
      } catch (err) {
        console.warn('Could not fetch today status:', err);
      }
    };
    checkStatus();
  }, []);

  const isClockedIn = !!(activeAttendance && activeAttendance.clockInTime && !activeAttendance.clockOutTime);

  const handleOpenInputKegiatan = () => {
    if (userProfile.role === 'CHIEF' || userProfile.rank === 'CHIEF') {
      navigate('/validasi-patroli/xxxxx_xxxxxxxxxxxxx.php');
    } else if (userProfile.role === 'COMMANDER' || userProfile.rank === 'DANRU') {
      navigate('/validasi-patroli/xxxxx_xxxxxxxxxxxx.php');
    } else if (userProfile.division === 'DRIVER' || userProfile.role === 'DRIVER') {
      navigate('/validasi-patroli/xxxxx_xxxxxxxxxx.php');
    } else if (userProfile.division === 'CLEANING' || userProfile.role === 'STAFF') {
      navigate('/validasi-patroli/xxxxx_xxxxxxxxxxxxxx.php');
    } else {
      navigate('/validasi-patroli/xxxxx_xxxxxxxxx.php');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f4f7fa] pb-16 select-none relative">
      {/* Top Greeting Header (100% patroli.site parity, exactly 77px height) */}
      <header
        style={{
          background: 'linear-gradient(135deg,#0d6efd,#4dabf7)',
          color: '#fff',
          padding: '12px 10px',
          textAlign: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,.4)',
                    position: 'relative',
        }}
      >
        {/* Link back to Web Admin Command Center */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-2 left-2 bg-white/20 hover:bg-white/30 text-white rounded px-2 py-0.5 text-[10px] font-semibold transition"
          title="Buka Web Admin Command Center"
        >
          ← Web Admin
        </button>
        <div style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '.5px' }}>
          ðŸ‘‹ HELLO, {userProfile.fullName}
        </div>
        <div style={{ marginTop: '6px' }}>
          <span
            style={{
              background: 'rgba(255,255,255,.1)',
              padding: '4px 10px',
              fontSize: '12px',
              display: 'inline-block',
              border: '1px solid rgba(255,255,255,.2)',
            }}
          >
            {userProfile.division}
          </span>
          <span
            style={{
              background: 'rgba(255,255,255,.15)',
              padding: '4px 10px',
              fontSize: '12px',
              display: 'inline-block',
              marginLeft: '5px',
              border: '1px solid rgba(255,255,255,.2)',
            }}
          >
            ðŸ“ KANTOR PUSAT
          </span>
        </div>

        {/* Discreet Role Switcher dropdown toggle */}
        <div className="absolute top-2 right-2 opacity-30 hover:opacity-100 transition-opacity">
          <select
            value={userProfile.role}
            onChange={(e) => {
              const role = e.target.value;
              if (role === 'CHIEF') {
                setUserProfile({
                  id: '1447',
                  fullName: 'HENDRA CHIEF',
                  username: 'hendra.chief',
                  role: 'CHIEF',
                  division: 'SECURITY',
                  badgeNumber: 'NIK-SEC-1447',
                  rank: 'CHIEF',
                });
              } else if (role === 'COMMANDER') {
                setUserProfile({
                  id: '1430',
                  fullName: 'DANDAN KOMANDAN',
                  username: 'dandan.danru',
                  role: 'COMMANDER',
                  division: 'SECURITY',
                  badgeNumber: 'NIK-SEC-1430',
                  rank: 'DANRU',
                });
              } else if (role === 'DRIVER') {
                setUserProfile({
                  id: '1501',
                  fullName: 'JOKO DRIVER',
                  username: 'joko.driver',
                  role: 'DRIVER',
                  division: 'DRIVER',
                  badgeNumber: 'NIK-DRV-001',
                  rank: 'DRIVER',
                });
              } else if (role === 'STAFF') {
                setUserProfile({
                  id: '1601',
                  fullName: 'SITI CLEANING',
                  username: 'siti.cleaning',
                  role: 'STAFF',
                  division: 'CLEANING',
                  badgeNumber: 'NIK-CLN-001',
                  rank: 'STAFF',
                });
              } else {
                setUserProfile({
                  id: '1436',
                  fullName: 'BUDI SANTOSO',
                  username: 'budi.santoso',
                  role: 'SECURITY_OFFICER',
                  division: 'SECURITY',
                  badgeNumber: 'NIK-SEC-1436',
                  rank: 'ANGGOTA',
                });
              }
            }}
            className="bg-black/40 text-white border border-white/20 rounded px-1.5 py-0.5 text-[10px] font-semibold cursor-pointer outline-none"
            title="Ganti Peran Personil"
          >
            <option value="CHIEF" className="text-black">Chief (Hendra)</option>
            <option value="COMMANDER" className="text-black">Danru (Dandan)</option>
            <option value="SECURITY_OFFICER" className="text-black">Satpam (Budi)</option>
            <option value="DRIVER" className="text-black">Driver (Joko)</option>
            <option value="STAFF" className="text-black">Staff (Siti)</option>
          </select>
        </div>
      </header>

      {/* 8-Card Touch Grid: Navigating to Individual PHP Pages */}
      <main className="container" style={{ marginTop: '15px' }}>
        {/* CARD 1: ABSEN MASUK (#198754) vs ABSEN PULANG (#ffc107) */}
        {!isClockedIn ? (
          <button
            onClick={() => navigate('/validasi-patroli/xxxxx_xx.php')}
            style={{ backgroundColor: '#198754' }}
            className="card text ps-card"
          >
            <span className="ps-card-text">
              ABSEN<br />MASUK
            </span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/validasi-patroli/xxxxx_xxx.php')}
            style={{ backgroundColor: '#ffc107', color: '#000' }}
            className="card text ps-card"
          >
            <span className="ps-card-text" style={{ color: '#000' }}>
              ABSEN<br />PULANG
            </span>
          </button>
        )}

        {/* CARD 2: IZIN ALPHA (#0d6efd) vs INPUT KEGIATAN (#0d6efd) */}
        {!isClockedIn ? (
          <button
            onClick={() => navigate('/validasi-patroli/xxxxx_xxxx.php')}
            style={{ backgroundColor: '#0d6efd' }}
            className="card text ps-card"
          >
            <span className="ps-card-text">
              IZIN<br />ALPHA
            </span>
          </button>
        ) : (
          <button
            onClick={handleOpenInputKegiatan}
            style={{ backgroundColor: '#0d6efd' }}
            className="card text ps-card"
          >
            <span className="ps-card-text">
              INPUT<br />KEGIATAN
            </span>
          </button>
        )}

        {/* CARD 3: RIWAYAT ABSEN (#6f42c1) */}
        <button
          onClick={() => navigate('/validasi-patroli/xxxxx_xxxxx.php')}
          style={{ backgroundColor: '#6f42c1' }}
          className="card text ps-card"
        >
          <span className="ps-card-text">
            RIWAYAT<br />ABSEN
          </span>
        </button>

        {/* CARD 4: RIWAYAT KEGIATAN (#6f42c1) */}
        <button
          onClick={() => navigate('/validasi-patroli/xxxxx_xxxxxx.php')}
          style={{ backgroundColor: '#6f42c1' }}
          className="card text ps-card"
        >
          <span className="ps-card-text">
            RIWAYAT<br />KEGIATAN
          </span>
        </button>

        {/* CARD 5: PANIC BUTTON (#dc3545) */}
        <button
          onClick={() => navigate('/validasi-patroli/xxxxx_xxxxxxx.php')}
          style={{ backgroundColor: '#dc3545' }}
          className="card text ps-card"
        >
          <span className="ps-card-text">
            PANIC<br />BUTTON
          </span>
        </button>

        {/* CARD 6: UPDATE PROFILE (#17a2b8) */}
        <button
          onClick={() => navigate('/validasi-patroli/xxxxx_xxxxxxxx.php')}
          style={{ backgroundColor: '#17a2b8' }}
          className="card text ps-card"
        >
          <span className="ps-card-text">
            UPDATE<br />PROFILE
          </span>
        </button>

        {/* CARD 7: BANTUAN TEKNIS (#20c997) */}
        <a
          href="https://api.whatsapp.com/send?phone=6281215293593&text=Halo%21%20Admin%20Patroli%20Site.%20(patroli.site)%20"
          target="_blank"
          rel="noopener noreferrer"
          style={{ backgroundColor: '#20c997' }}
          className="card text ps-card"
        >
          <span className="ps-card-text">
            BANTUAN<br />TEKNIS
          </span>
        </a>

        {/* CARD 8: LOGOUT SISTEM (#000000) */}
        <button
          onClick={() => {
            if (window.confirm('Apakah Anda yakin akan keluar dari sistem?')) {
              localStorage.removeItem('patrol_auth_token');
              navigate('/login.php');
            }
          }}
          style={{ backgroundColor: '#000000' }}
          className="card text ps-card"
        >
          <span className="ps-card-text">
            LOGOUT<br />SISTEM
          </span>
        </button>
      </main>

      {/* Floating WhatsApp Action Button */}
      <a
        href="https://api.whatsapp.com/send?phone=6281215293593&text=Halo%21%20Admin%20Patroli%20Site.%20(patroli.site)%20"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        title="Hubungi Admin WhatsApp"
      >
        <img src="/admin.png" alt="Contact Center" />
      </a>

      {/* Bottom Marquee Running Text (18s linear animation) */}
      <footer className="marquee-container">
        <div className="marquee-text">
          <span className="text-red-500 font-bold mr-2">**</span>
          DISIPLIN ABSENSI MASUK DAN PULANG KERJA ADALAH BAGIAN PENTING DARI BUDAYA KERJA YANG BAIK
          <span className="text-red-500 font-bold mx-2">**</span>
          PEMBERITAHUAN OPERASIONAL KANTOR PUSAT: SELURUH PERSONIL FRONT DESK DAN SATPAM WAJIB MEMASTIKAN PINTU AKSES LOBI UTAMA TERKUNCI TEPAT PUKUL 21:00 WIB.
          <span className="text-red-500 font-bold ml-2">**</span>
        </div>
      </footer>

      {/* Initial Info Popup matching #modalPanduanAwal */}
      {isInfoModalOpen && (
        <div className="custom-modal show">
          <div className="custom-modal-box">
            <div className="custom-modal-header">
              ðŸ“Œ Informasi Sistem
              <span className="close-btn" onClick={() => setIsInfoModalOpen(false)}>Ã—</span>
            </div>
            <div className="custom-modal-body flex justify-center items-center">
              <div className="info-box text-center w-full">
                âš ï¸ Silakan absen masuk terlebih dahulu untuk dapat input kegiatan. Jangan lupa absen pulang saat selesai shift/jaga.
              </div>
            </div>
            <div className="custom-modal-footer">
              <button onClick={() => setIsInfoModalOpen(false)}>
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



