import React from 'react';
import { 
  LayoutGrid, Package, ClipboardList, Settings, Warehouse, 
  LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, PackageSearch, 
  Store, Users, FileText, LogOut, Truck, BarChart3
} from 'lucide-react';
import logoEsTeh from '../assets/logo.png'; 

interface SidebarProps {
  role: 'karyawan' | 'gudang' | 'owner';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userInitials: string;
  userName: string;
  userRole: string;
  isMobileOpen: boolean;
  toggleMobile: () => void;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  role, activeTab, setActiveTab, userInitials, userName, userRole, 
  isMobileOpen, toggleMobile, onLogout 
}) => {
  
  const menus: Record<string, MenuItem[]> = {
    karyawan: [
      { id: 'transaksi', label: 'Kasir / Transaksi', icon: <LayoutGrid size={20} /> },
      { id: 'produk', label: 'Kelola Menu', icon: <ClipboardList size={20} /> },
      { id: 'stok', label: 'Stok & Request', icon: <Package size={20} /> },
      { id: 'penerimaan', label: 'Terima Barang', icon: <Truck size={20} /> },
    ],
    gudang: [
      { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
      { id: 'masuk', label: 'Barang Masuk', icon: <ArrowDownToLine size={20} /> },
      { id: 'keluar', label: 'Barang Keluar', icon: <ArrowUpFromLine size={20} /> },
      { id: 'opname', label: 'Stok Opname', icon: <PackageSearch size={20} /> },
    ],
    owner: [
      { id: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard size={20} /> },
      { id: 'stok', label: 'Stok All Outlet', icon: <BarChart3 size={20} /> }, // <-- NEW USE CASE 12
      { id: 'outlet', label: 'Manajemen Outlet', icon: <Store size={20} /> },
      { id: 'karyawan', label: 'Data Karyawan', icon: <Users size={20} /> },
      { id: 'laporan', label: 'Laporan Keuangan', icon: <FileText size={20} /> },
    ]
  };

  const currentMenu = menus[role] || [];
  const roleLabel = role === 'owner' ? 'Owner Panel' : role === 'gudang' ? 'Gudang Pusat' : 'Outlet Staff';

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={toggleMobile}></div>
      )}

      <div className={`fixed top-0 left-0 h-full w-[280px] bg-white border-r border-[#E3E9D5] flex flex-col z-50 transition-transform duration-300 shadow-xl shadow-[#A1BC98]/5 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center pt-8 pb-6 border-b border-[#F1F3E0]">
          <div className="w-20 h-20 rounded-full bg-[#F1F3E0] p-1.5 shadow-sm mb-3">
             <img src={logoEsTeh} alt="Es Teh Favorit" className="w-full h-full object-contain rounded-full" />
          </div>
          <h2 className="font-bold text-[#4A5347] text-lg">Es Teh Favorit</h2>
          <span className="px-3 py-1 bg-[#F1F3E0] text-[#A1BC98] text-xs font-bold rounded-full mt-1 uppercase tracking-wider">
            {roleLabel}
          </span>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-1">
          {currentMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if(window.innerWidth < 768) toggleMobile();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-[#A1BC98] text-white shadow-lg shadow-[#A1BC98]/30 font-semibold' 
                  : 'text-[#778873] hover:bg-[#F1F3E0] hover:text-[#4A5347]'
              }`}
            >
              <div className={`${activeTab === item.id ? 'text-white' : 'text-[#A1BC98] group-hover:text-[#4A5347]'}`}>
                {item.icon}
              </div>
              <span className="text-sm text-left">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-5 border-t border-[#F1F3E0] bg-[#FDFDFD]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F1F3E0]/50 border border-[#E3E9D5]">
            <div className="w-10 h-10 rounded-full bg-[#A1BC98] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {userInitials}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-bold text-sm text-[#4A5347] truncate">{userName}</div>
              <div className="text-[10px] text-[#778873] uppercase tracking-wide truncate">{userRole}</div>
            </div>
            <button 
              onClick={onLogout} 
              className="p-2 text-[#FF7675] hover:bg-[#FFE9B8]/30 rounded-lg transition-colors" 
              title="Logout"
            >
               <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;