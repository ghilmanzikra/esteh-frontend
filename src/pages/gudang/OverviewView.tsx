import React from 'react';
import { Package, TrendingUp, ArrowUpFromLine, ArrowDownToLine, AlertTriangle } from 'lucide-react';

const OverviewView = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total SKU', val: '124 Item', icon: <Package />, color: 'bg-[#E3E9D5] text-[#A1BC98]' },
          { label: 'Barang Masuk', val: '12 PO', sub: 'Hari ini', icon: <ArrowDownToLine />, color: 'bg-[#E3E9D5] text-[#A1BC98]' },
          { label: 'Barang Keluar', val: '8 Kiriman', sub: 'Menunggu', icon: <ArrowUpFromLine />, color: 'bg-[#E3E9D5] text-[#A1BC98]' },
          { label: 'Stok Menipis', val: '5 Item', sub: 'Perlu Restock', icon: <AlertTriangle />, color: 'bg-[#FFE9B8] text-[#6b5310]' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E3E9D5] flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              {React.cloneElement(stat.icon as React.ReactElement, { size: 24 })}
            </div>
            <div>
              <p className="text-sm text-[#778873]">{stat.label}</p>
              <h4 className="text-2xl font-bold text-[#4A5347]">{stat.val}</h4>
              {stat.sub && <span className="text-xs text-[#778873]/80">{stat.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white p-6 rounded-3xl border border-[#E3E9D5] shadow-sm">
        <h3 className="font-bold text-lg text-[#4A5347] mb-4">Aktivitas Terkini</h3>
        <div className="space-y-4">
          {[
            { action: 'Barang Masuk', desc: 'Terima 50kg Gula Cair dari Supplier A', time: '10:30', type: 'in' },
            { action: 'Barang Keluar', desc: 'Kirim stok ke Outlet Ahmad Yani', time: '09:15', type: 'out' },
            { action: 'Stok Opname', desc: 'Update stok fisik Cup 22oz', time: 'Yesterday', type: 'update' },
          ].map((log, i) => (
            <div key={i} className="flex items-start gap-4 p-3 hover:bg-[#F8FAF7] rounded-xl transition-colors border-b border-[#F1F3E0] last:border-0">
              <div className={`w-2 h-2 rounded-full mt-2 ${log.type === 'in' ? 'bg-[#A1BC98]' : log.type === 'out' ? 'bg-[#FF7675]' : 'bg-[#FDCB6E]'}`}></div>
              <div className="flex-1">
                <h5 className="font-bold text-[#4A5347] text-sm">{log.action}</h5>
                <p className="text-xs text-[#778873]">{log.desc}</p>
              </div>
              <span className="text-xs text-[#778873] font-medium">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewView;