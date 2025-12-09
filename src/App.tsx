import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
// --- UPDATE PATH IMPORT DISINI ---
import KaryawanPage from './pages/karyawan/KaryawanPage'; 
// ---------------------------------
import GudangPage from './pages/gudang/GudangPage';
import OwnerPage from './pages/owner/OwnerPage';

type Role = 'karyawan' | 'gudang' | 'owner';

function App() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState<string>('transaksi'); // Default tab karyawan
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const handleLogin = (role: Role) => {
    setActiveRole(role);
    if (role === 'karyawan') setActiveTab('transaksi');
    if (role === 'gudang') setActiveTab('overview');
    if (role === 'owner') setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setActiveRole(null);
    setIsMobileOpen(false);
  }

  const getUserDetails = () => {
    if (activeRole === 'karyawan') return { initial: 'GH', name: 'Ghilman', role: 'Outlet Staff' };
    if (activeRole === 'gudang') return { initial: 'SF', name: 'Staff Gudang', role: 'Gudang Pusat' };
    if (activeRole === 'owner') return { initial: 'OW', name: 'Pak Owner', role: 'Pemilik' };
    return { initial: '', name: '', role: '' };
  };

  if (!activeRole) {
    return <LoginPage onLogin={(r) => handleLogin(r as Role)} />;
  }

  const user = getUserDetails();

  return (
    <div className="flex h-screen w-full bg-[#F1F3E0] font-sans text-[#4A5347]">
      <Sidebar 
        role={activeRole} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userInitials={user.initial}
        userName={user.name}
        userRole={user.role}
        isMobileOpen={isMobileOpen}
        toggleMobile={toggleMobile}
        onLogout={handleLogout}
      />

      {/* Main Content dengan Margin untuk Sidebar */}
      <div className="flex-1 md:ml-[280px] w-full transition-all duration-300">
        {activeRole === 'karyawan' && (
          // KaryawanPage sekarang menerima activeTab untuk routing internalnya
          <KaryawanPage 
            isMobileOpen={isMobileOpen} 
            toggleMobile={toggleMobile} 
            activeTab={activeTab} 
          />
        )}
        {activeRole === 'gudang' && (
          <GudangPage 
            isMobileOpen={isMobileOpen} 
            toggleMobile={toggleMobile}
            activeTab={activeTab} // <-- Tambahkan ini! PENTING!
          />
        )}
        {activeRole === 'owner' && (
          <OwnerPage 
            isMobileOpen={isMobileOpen} 
            toggleMobile={toggleMobile}
            activeTab={activeTab} // <-- PASTIKAN INI ADA
          />
        )}
      </div>
    </div>
  );
}

export default App;