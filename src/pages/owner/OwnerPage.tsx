import React from 'react';
import { Menu, Bell } from 'lucide-react';
import DashboardView from './DashboardView';
import OutletView from './OutletView';
import KaryawanView from './KaryawanView';
import LaporanView from './LaporanView';
import StokAllOutletView from './StokAllOutletView'; // Import view baru

interface OwnerPageProps {
  isMobileOpen: boolean;
  toggleMobile: () => void;
  activeTab?: string;
}

const OwnerPage: React.FC<OwnerPageProps> = ({ isMobileOpen, toggleMobile, activeTab = 'dashboard' }) => {
  
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'stok': return <StokAllOutletView />; // Route baru
      case 'outlet': return <OutletView />;
      case 'karyawan': return <KaryawanView />;
      case 'laporan': return <LaporanView />;
      default: return <DashboardView />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Dashboard';
      case 'stok': return 'Monitoring Stok Global'; // Judul baru
      case 'outlet': return 'Manajemen Outlet';
      case 'karyawan': return 'Data Karyawan';
      case 'laporan': return 'Laporan Keuangan';
      default: return 'Owner Panel';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F1F3E0] overflow-hidden">
      {/* Header */}
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
              Selamat datang Pak Owner, bisnis Anda berjalan lancar hari ini. 🚀
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-3 bg-white text-[#A1BC98] rounded-xl shadow-sm border border-[#E3E9D5] hover:bg-[#A1BC98] hover:text-white transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#FF7675] rounded-full border border-white"></span>
          </button>
          <div className="h-10 w-10 bg-[#4A5347] rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm">
            OW
          </div>
        </div>
      </header>

      {/* Konten */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-6 scrollbar-hide">
        {renderContent()}
      </main>
    </div>
  );
};

export default OwnerPage;