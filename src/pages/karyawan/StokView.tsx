import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Send, Package, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { StokOutletItem } from '../../types';

const StokView = () => {
  const [stocks, setStocks] = useState<StokOutletItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Stok
  const fetchStok = async () => {
    try {
      setLoading(true);
      const res = await api.getStokOutlet();
      console.log("🔥 DATA STOK OUTLET:", res);
      
      if (Array.isArray(res)) setStocks(res);
      // @ts-ignore
      else if (res.data) setStocks(res.data);
      else setStocks([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStok();
  }, []);

  const handleRequest = async (id: number) => {
    const qty = prompt("Masukkan jumlah permintaan stok (misal: 10):");
    if (!qty) return;

    try {
        await api.requestStok({ bahan_id: id, jumlah: parseFloat(qty) });
        alert("Permintaan stok terkirim ke Gudang!");
    } catch (err: any) {
        alert("Gagal request: " + err.message);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-[#A1BC98]"/></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.length === 0 ? <p className="text-center w-full col-span-3 text-[#778873]">Data stok kosong.</p> : 
         stocks.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E3E9D5]">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#F1F3E0] text-[#A1BC98] rounded-xl">
                <Package size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Aman' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.status || 'Unknown'}
              </span>
            </div>
            
            <h4 className="font-bold text-[#4A5347] text-lg">{item.bahan}</h4>
            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-xs text-[#778873]">Sisa Stok</p>
                <p className="text-2xl font-bold text-[#4A5347]">{item.stok} <span className="text-sm font-medium text-[#778873]">{item.satuan}</span></p>
              </div>
              <button onClick={() => handleRequest(item.id)} className="flex items-center gap-2 px-4 py-2 bg-[#A1BC98] text-white text-xs font-bold rounded-lg hover:bg-[#8FAC86]">
                 <Send size={14} /> Ajukan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StokView;