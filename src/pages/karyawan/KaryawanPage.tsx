import React from 'react';
import { Menu, Bell } from 'lucide-react';

// --- IMPORT KOMPONEN ASLI (Sudah di-uncomment) ---
import TransaksiView from './TransaksiView';
import ProdukView from './ProdukView';
import StokView from './StokView';
import RiwayatTransaksi from './RiwayatTransaksi'; // Pastikan nama file ini benar

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
        // Penerimaan belum ada View khususnya, jadi kita pakai inline JSX dulu tidak apa-apa
        return (
          <div className="flex items-center justify-center h-full text-[#778873] bg-white rounded-3xl border border-[#E3E9D5] p-10 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Fitur Penerimaan Barang</h2>
              <p>Halaman ini akan menampilkan daftar pengiriman dari gudang untuk dikonfirmasi.</p>
            </div>
          </div>
        );
      default:
        return <TransaksiView />;
    }
  };

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
          <button className="p-3 bg-white text-[#A1BC98] rounded-xl shadow-sm border border-[#E3E9D5] hover:bg-[#A1BC98] hover:text-white transition-all relative group">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#FF7675] rounded-full border border-white"></span>
          </button>
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

export default KaryawanPage;