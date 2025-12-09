import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, Store, Filter } from 'lucide-react';

interface StockData {
  id: number;
  outlet: string;
  item: string;
  qty: number;
  unit: string;
  min: number;
  status: 'Aman' | 'Menipis' | 'Habis';
}

const StokAllOutletView = () => {
  // Simulasi Data Stok Terpusat
  const [stocks] = useState<StockData[]>([
    { id: 1, outlet: 'Outlet Ahmad Yani', item: 'Bubuk Teh', qty: 25, unit: 'Kg', min: 10, status: 'Aman' },
    { id: 2, outlet: 'Outlet Ahmad Yani', item: 'Gula Cair', qty: 5, unit: 'L', min: 15, status: 'Menipis' },
    { id: 3, outlet: 'Outlet Sudirman', item: 'Cup 22oz', qty: 0, unit: 'Pcs', min: 50, status: 'Habis' },
    { id: 4, outlet: 'Outlet Sudirman', item: 'Sedotan', qty: 500, unit: 'Pcs', min: 100, status: 'Aman' },
    { id: 5, outlet: 'Outlet Panam', item: 'Boba', qty: 2, unit: 'Kg', min: 5, status: 'Menipis' },
  ]);

  const [filter, setFilter] = useState('');

  // Filter logika
  const filteredStocks = stocks.filter(s => 
    s.outlet.toLowerCase().includes(filter.toLowerCase()) || 
    s.item.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E3E9D5] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#4A5347]">Monitoring Stok Global</h2>
          <p className="text-sm text-[#778873]">Pantau ketersediaan bahan di semua cabang</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1BC98]" size={18} />
            <input 
              type="text" 
              placeholder="Cari outlet / bahan..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-[#D2DCB6] focus:outline-none focus:border-[#A1BC98] text-[#4A5347] w-64"
            />
          </div>
          <button className="p-2.5 border border-[#D2DCB6] rounded-xl text-[#778873] hover:bg-[#F1F3E0]">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#F5B8B8]/20 border border-[#F5B8B8] rounded-xl text-[#752323] whitespace-nowrap">
          <AlertTriangle size={20} /> 
          <span className="font-bold">1 Barang Habis (Merah)</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-[#FFE9B8]/20 border border-[#FFE9B8] rounded-xl text-[#6b5310] whitespace-nowrap">
          <AlertTriangle size={20} /> 
          <span className="font-bold">2 Barang Menipis (Kuning)</span>
        </div>
      </div>

      {/* Table Stok */}
      <div className="flex-1 bg-white rounded-3xl border border-[#E3E9D5] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAF7] text-[#778873] text-sm font-semibold sticky top-0 z-10">
              <tr>
                <th className="p-5 pl-8">Lokasi Outlet</th>
                <th className="p-5">Nama Bahan</th>
                <th className="p-5">Sisa Stok</th>
                <th className="p-5">Min. Stok</th>
                <th className="p-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3E0] text-[#4A5347]">
              {filteredStocks.map((row) => (
                <tr key={row.id} className="hover:bg-[#FAFCF9] transition-colors">
                  <td className="p-5 pl-8 font-medium flex items-center gap-2">
                    <Store size={16} className="text-[#A1BC98]" /> {row.outlet}
                  </td>
                  <td className="p-5 font-bold">{row.item}</td>
                  <td className="p-5">
                    {row.qty} <span className="text-xs text-[#778873]">{row.unit}</span>
                  </td>
                  <td className="p-5 text-sm text-[#778873]">
                    {row.min} {row.unit}
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1 mx-auto w-fit ${
                      row.status === 'Aman' ? 'bg-[#B8E6B8]/30 text-[#2d5a2d]' :
                      row.status === 'Menipis' ? 'bg-[#FFE9B8]/50 text-[#6b5310]' :
                      'bg-[#F5B8B8]/30 text-[#752323]'
                    }`}>
                      {row.status === 'Aman' ? <CheckCircle size={12}/> : <AlertTriangle size={12}/>}
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StokAllOutletView;