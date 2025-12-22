import React, { useEffect, useState } from 'react';
import { Send, Package, Loader2, X } from 'lucide-react';
import { api } from '../../services/api';
import { StokOutletItem } from '../../types';

const StokView = () => {
  const [stocks, setStocks] = useState<StokOutletItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal Request
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedBahan, setSelectedBahan] = useState<{id: number, nama: string} | null>(null);
  const [requestQty, setRequestQty] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Stok
  const fetchStok = async () => {
    try {
      setLoading(true);
      const res = await api.getStokOutlet();
      
      if (Array.isArray(res)) {
        setStocks(res);
      } else if ((res as any).data && Array.isArray((res as any).data)) {
        setStocks((res as any).data);
      } else {
        setStocks([]);
      }
    } catch (err) {
      console.error("Gagal ambil stok:", err);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStok();
  }, []);

  // Buka Modal
  const openRequestModal = (bahanId: number, namaBahan: string) => {
      setSelectedBahan({ id: bahanId, nama: namaBahan });
      setRequestQty('');
      setIsRequestModalOpen(true);
  };

  // Tutup Modal
  const closeRequestModal = () => {
      setIsRequestModalOpen(false);
      setSelectedBahan(null);
  };

  // Handle Kirim Request
  const handleSubmitRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedBahan || !requestQty) return;

      const jumlah = parseFloat(requestQty);
      if (isNaN(jumlah) || jumlah <= 0) {
          alert("Jumlah harus angka valid dan lebih dari 0");
          return;
      }

      try {
          setSubmitting(true);
          await api.requestStok({ 
            bahan_id: selectedBahan.id, 
            jumlah: jumlah 
          });
          alert(`Permintaan stok ${selectedBahan.nama} berhasil dikirim! 🚀`);
          closeRequestModal();
      } catch (err: any) {
          alert("Gagal request: " + err.message);
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-[#A1BC98]"/></div>;

  return (
    <div className="space-y-6">
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
          stocks.map((item, idx) => (
          <div key={item.id || idx} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E3E9D5] hover:border-[#A1BC98] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#F1F3E0] text-[#A1BC98] rounded-xl">
                <Package size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Aman' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.status || (item.stok > 10 ? 'Aman' : 'Kritis')}
              </span>
            </div>
            
            <h4 className="font-bold text-[#4A5347] text-lg">
                {typeof item.bahan === 'object' ? item.bahan.nama : item.bahan}
            </h4>

            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-xs text-[#778873]">Sisa Stok</p>
                <p className="text-2xl font-bold text-[#4A5347]">
                    {item.stok} 
                    <span className="text-sm font-medium text-[#778873] ml-1">
                        {typeof item.bahan === 'object' ? item.bahan.satuan : ''}
                    </span>
                </p>
              </div>
              
              <button 
                onClick={() => openRequestModal(item.bahan_id || (item.bahan as any).id, (item.bahan as any).nama)} 
                className="flex items-center gap-2 px-4 py-2 bg-[#A1BC98] text-white text-xs font-bold rounded-lg hover:bg-[#8FAC86] active:scale-95 transition-transform"
              >
                  <Send size={14} /> Ajukan
              </button>
            </div>
          </div>
        )))}
      </div>

      {/* MODAL POP-UP REQUEST */}
      {isRequestModalOpen && selectedBahan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 relative">
                <button 
                    onClick={closeRequestModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                <h3 className="text-lg font-bold text-[#2C3E2D] mb-1">Request Stok</h3>
                <p className="text-sm text-[#5A6C5B] mb-6">Ajukan permintaan <b>{selectedBahan.nama}</b> ke gudang.</p>

                <form onSubmit={handleSubmitRequest}>
                    <div className="space-y-2 mb-6">
                        <label className="text-xs font-bold text-[#778873] uppercase">Jumlah Permintaan</label>
                        <input 
                            type="number"
                            step="0.1"
                            value={requestQty}
                            onChange={(e) => setRequestQty(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#A1BC98] focus:ring-2 focus:ring-[#A1BC98]/20 outline-none text-lg font-bold text-[#2C3E2D]"
                            placeholder="0"
                            autoFocus
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full py-3 bg-[#4A5347] text-white font-bold rounded-xl hover:bg-[#2C3E2D] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18}/> : <Send size={18} />}
                        {submitting ? 'Mengirim...' : 'Kirim Permintaan'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default StokView;