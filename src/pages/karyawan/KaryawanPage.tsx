import React, { useEffect } from 'react';
import { Menu } from 'lucide-react';
import { api } from '../../services/api';

// --- IMPORT KOMPONEN ASLI (Sudah di-uncomment) ---
import TransaksiView from './TransaksiView';
import ProdukView from './ProdukView';
import StokView from './StokView';
import RiwayatTransaksi from './RiwayatTransaksi'; // Pastikan nama file ini benar
import PengajuanView from './PengajuanView';

interface KaryawanPageProps {
  isMobileOpen: boolean;
  toggleMobile: () => void;
  activeTab?: string;
}

const KaryawanPage: React.FC<KaryawanPageProps> = ({ isMobileOpen, toggleMobile, activeTab = 'transaksi' }) => {
  
  // Fungsi Routing Internal Karyawan
  const renderContent = () => {
    switch (activeTab) {
      case 'transaksi':
        return <TransaksiView />;
      case 'riwayat':
        return <RiwayatTransaksi />;
      case 'produk':
        return <ProdukView />;
      case 'stok':
        return <StokView />;
      case 'penerimaan':
        return <PengajuanView />;
      default:
        return <TransaksiView />;
    }
  };

  // Activate GET /me on mount to validate token and warm user data
  useEffect(() => {
    (async () => {
      try { await api.getMe(); } catch (_) { /* ignore */ }
    })();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#F1F3E0] overflow-hidden">
      {/* Header Dashboard (Top Bar) */}
      <header className="h-[80px] px-6 md:px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMobile} 
            className="md:hidden p-2 text-[#4A5347] bg-white rounded-xl shadow-sm hover:bg-[#E3E9D5] transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-[#4A5347]">
              {/* Logika Judul Header Dinamis */}
              {activeTab === 'transaksi' && 'Kasir Outlet'}
              {activeTab === 'riwayat' && 'Riwayat Transaksi'}
              {activeTab === 'produk' && 'Manajemen Menu'}
              {activeTab === 'stok' && 'Stok Bahan Baku'}
              {activeTab === 'penerimaan' && 'Barang Masuk'}
            </h1>
            <p className="text-xs text-[#778873] hidden md:block">
              Halo Ghilman, selamat bekerja! Semangat ya! ✨
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-[#A1BC98] rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm">
            GH
          </div>
        </div>
      </header>

      {/* Konten Utama (Scrollable) */}
      <main className="flex-1 overflow-hidden px-4 md:px-8 pb-6">
        {renderContent()}
      </main>
    </div>
  );
};
// (effect moved inside component)

export default KaryawanPage;