import React from 'react';
import { Menu, Bell } from 'lucide-react';
import OverviewView from './OverviewView';
import BarangMasukView from './BarangMasukView';
import BarangKeluarView from './BarangKeluarView';
import StokOpnameView from './StokOpnameView';

// Interface untuk Props
interface GudangPageProps {
  isMobileOpen: boolean;
  toggleMobile: () => void;
  activeTab?: string; // Diterima dari App.tsx
}

const GudangPage: React.FC<GudangPageProps> = ({ isMobileOpen, toggleMobile, activeTab = 'overview' }) => {
  
  // Fungsi Routing Internal Gudang
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'masuk':
        return <BarangMasukView />;
      case 'keluar':
        return <BarangKeluarView />;
      case 'opname':
        return <StokOpnameView />;
      default:
        return <OverviewView />;
    }
  };

  // Judul Halaman Dinamis
  const getTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard Gudang';
      case 'masuk': return 'Kelola Barang Masuk';
      case 'keluar': return 'Kelola Pengiriman';
      case 'opname': return 'Stok Opname / Inventaris';
      default: return 'Gudang';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F1F3E0] overflow-hidden">
      {/* Header Dashboard */}
      <header className="h-[80px] px-6 md:px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMobile} 
            className="md:hidden p-2 text-[#4A5347] bg-white rounded-xl shadow-sm hover:bg-[#E3E9D5] transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-[#4A5347]">{getTitle()}</h1>
            <p className="text-xs text-[#778873] hidden md:block">
              Pantau arus barang secara real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-3 bg-white text-[#A1BC98] rounded-xl shadow-sm border border-[#E3E9D5] hover:bg-[#A1BC98] hover:text-white transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#FF7675] rounded-full border border-white"></span>
          </button>
          <div className="h-10 w-10 bg-[#A1BC98] rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm">
            SF
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-6 scrollbar-hide">
        {renderContent()}
      </main>
    </div>
  );
};

export default GudangPage;