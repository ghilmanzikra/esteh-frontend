import React from 'react';
import { Truck, MapPin, Package, MoreHorizontal, CheckCircle } from 'lucide-react';

const BarangKeluarView = () => {
  const outgoingItems = [
    { id: 'OUT-001', date: '2025-11-26', dest: 'Outlet Ahmad Yani', items: 'Bubuk Teh (10kg), Gula (5L)', status: 'Dikirim' },
    { id: 'OUT-002', date: '2025-11-26', dest: 'Outlet Panam', items: 'Cup 22oz (500pcs)', status: 'Pending' },
    { id: 'OUT-003', date: '2025-11-25', dest: 'Outlet Sudirman', items: 'Sedotan (1000pcs)', status: 'Diterima' },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#4A5347]">Pengiriman Barang</h2>
          <p className="text-sm text-[#778873]">Kelola permintaan stok dari outlet</p>
        </div>
        <button className="px-5 py-2.5 bg-[#A1BC98] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#A1BC98]/20 hover:bg-[#8FAC86] transition-all flex items-center gap-2">
          <Truck size={18} /> Buat Pengiriman Baru
        </button>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-[#E3E9D5] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAF7] text-[#778873] text-sm font-semibold">
              <tr>
                <th className="p-5 pl-6">ID Pengiriman</th>
                <th className="p-5">Tujuan Outlet</th>
                <th className="p-5">Rincian Barang</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3E0] text-[#4A5347]">
              {outgoingItems.map(item => (
                <tr key={item.id} className="hover:bg-[#FAFCF9] transition-colors">
                  <td className="p-5 pl-6 text-sm font-medium text-[#778873]">#{item.id}</td>
                  <td className="p-5 font-bold flex items-center gap-2">
                    <MapPin size={16} className="text-[#A1BC98]" /> {item.dest}
                  </td>
                  <td className="p-5 text-sm">{item.items}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Diterima' ? 'bg-[#B8E6B8]/30 text-[#2d5a2d]' :
                      item.status === 'Dikirim' ? 'bg-[#FFE9B8]/50 text-[#6b5310]' :
                      'bg-[#E3E9D5] text-[#778873]'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button className="p-2 hover:bg-[#F1F3E0] rounded-lg text-[#778873] transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
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

export default BarangKeluarView;