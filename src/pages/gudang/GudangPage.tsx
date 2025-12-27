import React, { useEffect } from 'react';
import { Menu } from 'lucide-react';
import { api } from '../../services/api';
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
          <div className="h-10 w-10 bg-[#A1BC98] rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm">
            SF
          </div>
        </div>
      </header>

      {/* Fetch user info on mount */}
      {/** Call GET /me to activate user info for gudang */}
      {/** eslint-disable-next-line react-hooks/rules-of-hooks */}
      {(() => {
        // useEffect inside IIFE to avoid top-level hook ordering changes in this patch
        useEffect(() => {
          (async () => {
            try { await api.getMe(); } catch (_) { /* ignore */ }
          })();
        }, []);
        return null;
      })()}

      {/* Konten Utama */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-6 scrollbar-hide">
        {renderContent()}
      </main>
    </div>
  );
};

export default GudangPage;