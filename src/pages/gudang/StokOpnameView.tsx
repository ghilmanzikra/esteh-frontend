import React, { useEffect, useState } from 'react';
import { PackageSearch, Search, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const StokOpnameView = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStok = async () => {
        try {
            const res = await api.getStokGudang();
            console.log("🔥 STOK GUDANG:", res);
            if(res.data) setInventory(res.data);
            else if(Array.isArray(res)) setInventory(res);
        } catch(err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchStok();
  }, []);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-[#A1BC98]"/></div>;

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="bg-white p-4 rounded-2xl border border-[#E3E9D5] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1BC98]" size={20} />
          <input type="text" placeholder="Cari bahan..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D2DCB6] focus:outline-none focus:border-[#A1BC98] text-[#4A5347]" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.length === 0 ? <p className="col-span-3 text-center text-[#778873]">Gudang kosong.</p> :
         inventory.map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-[#E3E9D5] shadow-sm hover:border-[#A1BC98] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#F1F3E0] text-[#A1BC98] rounded-2xl"><PackageSearch size={24} /></div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Aman' ? 'bg-[#B8E6B8] text-[#2d5a2d]' : 'bg-[#F5B8B8] text-[#752323]'}`}>
                {item.status || (item.stok > 10 ? 'Aman' : 'Kritis')}
              </span>
            </div>
            <h4 className="font-bold text-[#4A5347] text-lg mb-1">{item.bahan?.nama || item.nama}</h4>
            <div className="pt-4 border-t border-[#F1F3E0]">
              <p className="text-xs text-[#778873] mb-1">Stok Tersedia</p>
              <p className="text-2xl font-bold text-[#4A5347]">{item.stok} <span className="text-sm font-medium text-[#778873]">{item.satuan}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default StokOpnameView;