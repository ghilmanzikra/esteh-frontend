import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Package, Check, X, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const BarangKeluarView = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
        setLoading(true);
        // Mengambil permintaan stok khusus untuk GUDANG
        const res = await api.getPermintaanStokGudang(); 
        console.log("🔥 PERMINTAAN STOK:", res);
        
        if(res.data) setRequests(res.data);
        else if(Array.isArray(res)) setRequests(res);
        else setRequests([]);
        
    } catch(err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id: number) => {
    if(!confirm("Setujui permintaan ini dan kirim barang?")) return;
    try {
        await api.updatePermintaanStatus(id, 'approved', undefined, true);
        alert("Permintaan disetujui! Barang sedang dikirim.");
        fetchRequests();
        window.dispatchEvent(new CustomEvent('permintaan:created'));
    } catch(err: any) {
        alert("Gagal: " + err.message);
    }
  };

  const handleReject = async (id: number) => {
    if(!confirm("Tolak permintaan ini?")) return;
    try {
      await api.updatePermintaanStatus(id, 'rejected', undefined, true);
      alert("Permintaan ditolak.");
      fetchRequests();
      window.dispatchEvent(new CustomEvent('permintaan:created'));
    } catch (err: any) {
      alert("Gagal: " + err.message);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-[#A1BC98]"/></div>;

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#4A5347]">Permintaan Stok Masuk</h2>
          <p className="text-sm text-[#778873]">Daftar request dari berbagai outlet</p>
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-3xl border border-[#E3E9D5] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAF7] text-[#778873] text-sm font-semibold">
              <tr>
                <th className="p-5 pl-6">ID Request</th>
                <th className="p-5">Outlet</th>
                <th className="p-5">Barang</th>
                <th className="p-5">Jumlah</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3E0] text-[#4A5347]">
              {requests.length === 0 ? (
                 <tr><td colSpan={6} className="p-8 text-center text-[#778873]">Tidak ada permintaan baru.</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} className="hover:bg-[#FAFCF9] transition-colors">
                    <td className="p-5 pl-6 text-sm font-medium text-[#778873]">#{req.id}</td>
                    <td className="p-5 font-bold flex items-center gap-2">
                      <MapPin size={16} className="text-[#A1BC98]" /> {req.outlet?.nama || `Outlet #${req.outlet_id}`}
                    </td>
                    <td className="p-5 text-sm">{req.bahan?.nama || `Bahan #${req.bahan_id}`}</td>
                    <td className="p-5 font-bold">{req.jumlah} {req.bahan?.satuan}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === 'approved' ? 'bg-[#B8E6B8]/30 text-[#2d5a2d]' :
                        req.status === 'pending' ? 'bg-[#FFE9B8]/50 text-[#6b5310]' :
                        'bg-[#E3E9D5] text-[#778873]'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                        {req.status === 'pending' && (
                          <div className="flex justify-center gap-2">
                          <button onClick={() => handleApprove(req.id)} className="p-2 bg-[#B8E6B8]/30 text-[#2d5a2d] rounded-lg hover:bg-[#B8E6B8] transition-colors" title="Setujui">
                            <Check size={18} />
                          </button>
                          <button onClick={() => handleReject(req.id)} className="p-2 bg-[#FFE9E9]/30 text-[#a12b2b] rounded-lg hover:bg-[#FFB8B8] transition-colors" title="Tolak">
                            <X size={18} />
                          </button>
                          </div>
                        )}
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
export default BarangKeluarView;