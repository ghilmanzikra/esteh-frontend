import { useEffect, useState } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { StokOutletItem } from '../../types';

const StokView = () => {
  const [stocks, setStocks] = useState<StokOutletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);

  // No request modal here: pengajuan hanya via PengajuanView

  // Fetch Stok
  const fetchStok = async () => {
    try {
      setLoading(true);
      const res = await api.getStokOutlet();
      let arr: any[] = [];
      if (Array.isArray(res)) arr = res;
      else if ((res as any).data && Array.isArray((res as any).data)) arr = (res as any).data;
      else arr = [];
      setStocks(arr);
      // compute low stock count using bahan threshold if available
      const low = arr.filter((it: any) => {
        const minThreshold = (it.bahan && (it.bahan.stok_minimum_outlet ?? it.bahan.stok_minimum)) ?? 10;
        return Number(it.stok ?? 0) <= Number(minThreshold);
      }).length;
      setLowStockCount(low);
    } catch (err) {
      console.error("Gagal ambil stok:", err);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStok();
    const handler = () => fetchStok();
    window.addEventListener('transaksi:created', handler as EventListener);
    window.addEventListener('transaksi:deleted', handler as EventListener);
    return () => {
      window.removeEventListener('transaksi:created', handler as EventListener);
      window.removeEventListener('transaksi:deleted', handler as EventListener);
    };
  }, []);

    // Pengajuan stok tidak ditampilkan di sini (hanya di PengajuanView)

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-[#A1BC98]"/></div>;

  return (
    <div className="space-y-6">
      {lowStockCount > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-300 p-4 rounded-lg text-yellow-800">
          <strong>{lowStockCount} bahan menipis</strong> — segera ajukan permintaan pengisian stok ke gudang.
        </div>
      )}
      <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#4A5347]">Stok Bahan Baku</h2>
          <button onClick={fetchStok} className="text-sm text-[#A1BC98] hover:underline">Refresh Data</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.length === 0 ? (
            <div className="col-span-3 text-center py-10 bg-[#F8FAF7] rounded-2xl border border-dashed border-[#D2DCB6]">
                <Package className="mx-auto text-[#D2DCB6] mb-2" size={40}/>
                <p className="text-[#778873]">Data stok outlet kosong / Belum ada pengiriman dari Gudang.</p>
            </div>
        ) : (
          stocks.map((item, idx) => {
            const rawStok = Number(item.stok ?? 0);
            const stokDisplay = Math.max(0, rawStok);
            // status rules: 0 -> Habis (red), <50 -> Kritis (yellow), >=50 -> Aman (green)
            const statusLabel = stokDisplay === 0 ? 'Habis' : (stokDisplay < 50 ? 'Kritis' : 'Aman');
            const borderClass = statusLabel === 'Aman' ? 'border-green-200' : statusLabel === 'Kritis' ? 'border-yellow-300' : 'border-red-300';
            const badgeClass = statusLabel === 'Aman' ? 'bg-green-100 text-green-700' : statusLabel === 'Kritis' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
            return (
              <div key={item.id || idx} className={`bg-white p-5 rounded-2xl shadow-sm ${borderClass} border hover:shadow-md transition-all`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-[#F1F3E0] text-[#A1BC98] rounded-xl">
                    <Package size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                    {item.status || statusLabel}
                  </span>
                </div>

                <h4 className="font-bold text-[#4A5347] text-lg">
                  {typeof item.bahan === 'object' ? item.bahan.nama : item.bahan}
                </h4>

                <div className="flex justify-between items-end mt-2">
                  <div>
                    <p className="text-xs text-[#778873]">Sisa Stok</p>
                    <p className="text-2xl font-bold text-[#4A5347]">
                      {stokDisplay}
                      <span className="text-sm font-medium text-[#778873] ml-1">
                        {typeof item.bahan === 'object' ? item.bahan.satuan : ''}
                      </span>
                    </p>
                  </div>

                  {/* Pengajuan hanya tersedia di menu Pengajuan */}
                </div>
              </div>
            );
          })
        )}
      </div>

        {/* Pengajuan stok tidak ditampilkan di sini (hanya di PengajuanView) */}
    </div>
  );
};

export default StokView;