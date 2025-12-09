import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { LaporanItem } from '../../types';

const LaporanView = () => {
  // 1. State Management
  const [laporan, setLaporan] = useState<LaporanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State Filter Tanggal (Default: Bulan Ini)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]; // YYYY-MM-01
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]; // YYYY-MM-30/31
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  // 2. Fetching Data Laporan
  const fetchLaporan = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.getLaporanPendapatan(startDate, endDate);
      console.log("🔥 DATA LAPORAN DARI BACKEND:", response);

      // --- PERBAIKAN LOGIKA DISINI ---
      // Backend mengembalikan data di dalam 'detail_per_hari', bukan 'data'
      if (response.detail_per_hari && Array.isArray(response.detail_per_hari)) {
        setLaporan(response.detail_per_hari);
      } else {
        setLaporan([]);
      }

    } catch (err: any) {
      console.error("Gagal ambil laporan:", err);
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetch saat tanggal berubah
  useEffect(() => {
    fetchLaporan();
  }, [startDate, endDate]);

  // 3. Handle Download
  const handleDownload = async () => {
    try {
      alert("Sedang mendownload laporan...");
      await api.downloadLaporan(startDate, endDate);
    } catch (err) {
      alert("Gagal download file. Coba lagi nanti.");
      console.error(err);
    }
  };

  // 4. Formatter Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E3E9D5] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          
          <div className="flex items-center gap-2 bg-[#F8FAF7] px-3 py-2 rounded-xl border border-[#D2DCB6]">
            <Calendar size={18} className="text-[#A1BC98]" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-[#4A5347] text-sm focus:outline-none"
            />
            <span className="text-[#778873]">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-[#4A5347] text-sm focus:outline-none"
            />
          </div>

          <button 
            onClick={fetchLaporan}
            className="p-2.5 border border-[#D2DCB6] rounded-xl text-[#778873] hover:bg-[#F1F3E0] hover:text-[#A1BC98] transition-colors"
            title="Refresh Data"
          >
            <Filter size={18} />
          </button>
        </div>
        
        <button 
          onClick={handleDownload}
          className="w-full md:w-auto px-6 py-2.5 bg-[#4A5347] text-white rounded-xl font-bold text-sm hover:bg-[#2d332b] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4A5347]/20"
        >
          <Download size={18} /> Download Excel
        </button>
      </div>

      {/* Laporan Table */}
      <div className="flex-1 bg-white rounded-3xl border border-[#E3E9D5] shadow-sm overflow-hidden flex flex-col relative">
        
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="animate-spin text-[#A1BC98]" />
              <p className="text-sm text-[#778873] animate-pulse">Menghitung cuan...</p>
            </div>
          </div>
        )}

        <div className="p-6 border-b border-[#F1F3E0] flex justify-between items-center">
          <h3 className="font-bold text-[#4A5347] text-lg flex items-center gap-2">
            <FileText className="text-[#A1BC98]" /> Laporan Transaksi
          </h3>
          <span className="text-xs text-[#778873] bg-[#F8FAF7] px-3 py-1 rounded-full border border-[#E3E9D5]">
            Menampilkan {laporan.length} data
          </span>
        </div>
        
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAF7] text-[#778873] text-sm font-semibold sticky top-0">
              <tr>
                <th className="p-4 pl-6">Tanggal</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Outlet</th>
                <th className="p-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3E0] text-[#4A5347] text-sm">
              {laporan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#778873]/60 italic">
                    Belum ada data transaksi pada periode ini.
                  </td>
                </tr>
              ) : (
                laporan.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FAFCF9] transition-colors">
                    <td className="p-4 pl-6 text-[#778873]">
                        {/* Asumsi field tanggal ada */}
                        {row.tanggal} 
                    </td>
                    <td className="p-4 font-bold">
                        {/* Karena detail item belum jelas, kita tulis general dulu */}
                        Rekap Harian
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[#E3E9D5] text-[#4A5347]">
                        Pemasukan
                      </span>
                    </td>
                    <td className="p-4 text-[#778873]">
                        - {/* Data outlet per hari mungkin belum ada di rekap harian */}
                    </td>
                    <td className="p-4 text-right font-bold text-[#A1BC98]">
                      {/* Gunakan optional chaining (?.) */}
                      {formatRupiah(row.pendapatan || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaporanView;