import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Store, DollarSign, ArrowUpRight, Award, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api'; 
import { DashboardResponse } from '../../types'; 

const DashboardView = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.getDashboard();
        console.log("🔥 DATA DASHBOARD UPDATE:", response);
        setDashboardData(response);
        // Activate GET /me for owner dashboard
        try { await api.getMe(); } catch(_) { /* ignore */ }
      } catch (err: any) {
        console.error("Gagal ambil dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-[#778873] gap-3">
        <Loader2 size={40} className="animate-spin text-[#A1BC98]" />
        <p className="font-medium animate-pulse">Sedang sinkronisasi data bisnis...</p>
      </div>
    );
  }

  // Ambil data dari object 'data' di dalam response
  const stats = dashboardData?.data || {
    pendapatan_hari_ini: 0,
    transaksi_hari_ini: 0,
    total_outlet: 0,
    total_karyawan: 0
  };

  return (
    <div className="space-y-6">
      {/* 1. Ringkasan Kartu REAL TIME */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Omset', 
            val: formatRupiah(stats.pendapatan_hari_ini), // PAKE DATA ASLI
            sub: 'Hari Ini', 
            icon: <DollarSign />, 
            bg: 'bg-[#A1BC98]', 
            text: 'text-white' 
          },
          { 
            label: 'Total Transaksi', 
            val: `${stats.transaksi_hari_ini} Pesanan`, // PAKE DATA ASLI
            sub: 'Hari Ini', 
            icon: <TrendingUp />, 
            bg: 'bg-white', 
            text: 'text-[#A1BC98]' 
          },
          { 
            label: 'Outlet Terdaftar', 
            val: `${stats.total_outlet} Cabang`, // PAKE DATA ASLI
            sub: 'Total Sistem', 
            icon: <Store />, 
            bg: 'bg-white', 
            text: 'text-[#A1BC98]' 
          },
          { 
            label: 'Total Karyawan', 
            val: `${stats.total_karyawan} Orang`, // PAKE DATA ASLI
            sub: 'Aktif bekerja', 
            icon: <Users />, 
            bg: 'bg-white', 
            text: 'text-[#A1BC98]' 
          },
        ].map((card, idx) => (
          <div key={idx} className={`p-5 rounded-3xl shadow-sm border border-[#E3E9D5] flex flex-col justify-between h-36 hover:shadow-md transition-all ${card.bg} ${card.text === 'text-white' ? 'text-white' : 'text-[#4A5347]'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider opacity-80`}>{card.label}</p>
                <h3 className="text-2xl font-bold mt-2">{card.val}</h3>
              </div>
              <div className={`p-2.5 rounded-xl ${card.text === 'text-white' ? 'bg-white/20' : 'bg-[#F1F3E0]'}`}>
                {React.cloneElement(card.icon as React.ReactElement<any>, { size: 20 })}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs opacity-80 font-medium">
              <ArrowUpRight size={14} /> {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Grafik & Best Seller (Masih Simulasi Visual Dulu karena data belum ada di endpoint dashboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grafik Penjualan */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E3E9D5] shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-[#4A5347] text-lg">Tren Pendapatan</h3>
              <p className="text-xs text-[#778873]">Grafik simulasi (Backend belum mengirim data grafik)</p>
            </div>
            <select className="text-xs bg-[#F1F3E0] text-[#778873] px-3 py-2 rounded-lg border-none outline-none cursor-pointer font-bold">
              <option>Minggu Ini</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-3 md:gap-6 px-2 min-h-[200px]">
            {[65, 45, 75, 50, 85, 95, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer relative">
                <div 
                  className="w-full bg-[#E3E9D5] rounded-t-xl relative group-hover:bg-[#A1BC98] transition-all duration-500 overflow-hidden"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-black/5 to-transparent"></div>
                </div>
                <p className="text-center text-xs text-[#778873] mt-3 font-bold">{['Sn','Sl','Rb','Km','Jm','Sb','Mn'][i]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Produk Terlaris */}
        <div className="bg-white p-6 rounded-3xl border border-[#E3E9D5] shadow-sm">
          <h3 className="font-bold text-[#4A5347] text-lg mb-1 flex items-center gap-2">
            <Award size={20} className="text-[#FDCB6E]" /> Menu Terlaris
          </h3>
          <p className="text-xs text-[#778873] mb-6">Data Simulasi</p>
          
          <div className="space-y-5">
            {[
              { nama: 'Es Teh Original', total_terjual: 145, color: 'bg-[#A1BC98]' },
              { nama: 'Red Velvet', total_terjual: 89, color: 'bg-[#FF7675]' },
              { nama: 'Milk Tea Boba', total_terjual: 64, color: 'bg-[#FDCB6E]' },
              { nama: 'Lemon Tea', total_terjual: 42, color: 'bg-[#D2DCB6]' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-[#4A5347]">{item.nama}</span>
                  <span className="text-[#778873] text-xs font-medium">{item.total_terjual} Terjual</span>
                </div>
                <div className="h-2.5 w-full bg-[#F1F3E0] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.color}`} 
                    style={{ width: `${Math.min(100, item.total_terjual / 1.5)}%` }} 
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;