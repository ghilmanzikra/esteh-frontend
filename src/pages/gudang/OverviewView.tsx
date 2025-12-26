import React, { useEffect, useState } from 'react';
import { Package, ArrowUpFromLine, ArrowDownToLine, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const OverviewView = () => {
  const [stats, setStats] = useState({
    total_stok: 0,
    barang_masuk: 0,
    barang_keluar: 0,
    stok_kritis: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Kita fetch beberapa endpoint sekaligus buat summary
        const [stokRes, masukRes, keluarRes] = await Promise.all([
            api.getStokGudang(),
            api.getBarangMasuk(),
            api.getBarangKeluar()
        ]);

        console.log("🔥 GUDANG DATA:", { stokRes, masukRes, keluarRes });

        // Hitung manual summary-nya (karena belum ada endpoint dashboard khusus gudang)
        const totalItems = Array.isArray(stokRes) ? stokRes.length : (stokRes.data?.length || 0);
        const totalMasuk = Array.isArray(masukRes) ? masukRes.length : (masukRes.data?.length || 0);
        const totalKeluar = Array.isArray(keluarRes) ? keluarRes.length : (keluarRes.data?.length || 0);
        
        // Cek stok kritis (misal < 10)
        let kritis = 0;
        const stokList = Array.isArray(stokRes) ? stokRes : (stokRes.data || []);
        stokList.forEach((item: any) => {
            if(item.stok <= (item.stok_minimum || 10)) kritis++;
        });

        setStats({
            total_stok: totalItems,
            barang_masuk: totalMasuk,
            barang_keluar: totalKeluar,
            stok_kritis: kritis
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-[#A1BC98]"/></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Item', val: `${stats.total_stok} Jenis`, Icon: Package, color: 'bg-[#E3E9D5] text-[#A1BC98]' },
          { label: 'Barang Masuk', val: `${stats.barang_masuk} PO`, sub: 'Total Riwayat', Icon: ArrowDownToLine, color: 'bg-[#E3E9D5] text-[#A1BC98]' },
          { label: 'Barang Keluar', val: `${stats.barang_keluar} Kiriman`, sub: 'Total Riwayat', Icon: ArrowUpFromLine, color: 'bg-[#E3E9D5] text-[#A1BC98]' },
          { label: 'Stok Menipis', val: `${stats.stok_kritis} Item`, sub: 'Perlu Restock', Icon: AlertTriangle, color: 'bg-[#FFE9B8] text-[#6b5310]' },
        ].map((stat, idx) => {
          const Icon = stat.Icon as any;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E3E9D5] flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-[#778873]">{stat.label}</p>
                <h4 className="text-2xl font-bold text-[#4A5347]">{stat.val}</h4>
                {stat.sub && <span className="text-xs text-[#778873]/80">{stat.sub}</span>}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Activity Log Placeholder */}
      <div className="bg-white p-6 rounded-3xl border border-[#E3E9D5] shadow-sm">
        <h3 className="font-bold text-lg text-[#4A5347] mb-4">Aktivitas Gudang</h3>
        <p className="text-sm text-[#778873] italic">Belum ada aktivitas terbaru.</p>
      </div>
    </div>
  );
};
export default OverviewView;