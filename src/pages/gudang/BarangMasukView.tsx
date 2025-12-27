import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, Package, Save, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const BarangMasukView = () => {
  const [items, setItems] = useState<any[]>([]);
  const [bahanList, setBahanList] = useState<any[]>([]); // Dropdown bahan
  const [loading, setLoading] = useState(true);
  
  const [newItem, setNewItem] = useState({ 
    bahan_id: '', 
    jumlah: '', 
    supplier: '' 
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
        setLoading(true);
        const [masukRes, bahanRes] = await Promise.all([
            api.getBarangMasuk(),
            api.getBahan() // Kita butuh list bahan master buat dropdown
        ]);
        
        if(masukRes.data) setItems(masukRes.data);
        else if(Array.isArray(masukRes)) setItems(masukRes);

        if(bahanRes.data) setBahanList(bahanRes.data);
        else if(Array.isArray(bahanRes)) setBahanList(bahanRes);

    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!newItem.bahan_id || !newItem.jumlah || !newItem.supplier) return alert("Isi semua data!");
    setSubmitting(true);
    try {
        if (editingId) {
            await api.updateBarangMasuk(editingId, {
                bahan_id: parseInt(newItem.bahan_id),
                jumlah: parseFloat(newItem.jumlah),
                supplier: newItem.supplier
            });
            alert('Data barang masuk diperbarui');
            setEditingId(null);
        } else {
            await api.createBarangMasuk({
                bahan_id: parseInt(newItem.bahan_id),
                jumlah: parseFloat(newItem.jumlah),
                supplier: newItem.supplier
            });
            alert("Stok berhasil ditambahkan!");
        }
        setNewItem({ bahan_id: '', jumlah: '', supplier: '' });
        fetchData();
        // notify other views
        window.dispatchEvent(new CustomEvent('permintaan:created'));
    } catch (err: any) {
        alert("Gagal: " + err.message);
    } finally {
        setSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setNewItem({ bahan_id: String(item.bahan_id || item.bahan?.id || ''), jumlah: String(item.jumlah || ''), supplier: item.supplier || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data barang masuk ini?')) return;
    try {
      await api.deleteBarangMasuk(id);
      alert('Data dihapus');
      fetchData();
      window.dispatchEvent(new CustomEvent('permintaan:created'));
    } catch (err: any) {
      alert('Gagal hapus: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="bg-white p-6 rounded-3xl border border-[#E3E9D5] shadow-sm">
        <h3 className="font-bold text-[#4A5347] mb-4 flex items-center gap-2">
          <Plus size={18} className="text-[#A1BC98]" /> Catat Penerimaan Baru
        </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
             <label className="text-xs font-bold text-[#778873]">Pilih Bahan</label>
             <select 
                value={newItem.bahan_id}
                onChange={(e) => setNewItem({...newItem, bahan_id: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D2DCB6] bg-white"
             >
                <option value="">-- Pilih Bahan --</option>
                {bahanList.map(b => (
                    <option key={b.id} value={b.id}>{b.nama} ({b.satuan})</option>
                ))}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-[#778873]">Jumlah</label>
             <input value={newItem.jumlah} onChange={(e) => setNewItem({...newItem, jumlah: e.target.value})} type="number" className="w-full px-4 py-2.5 rounded-xl border border-[#D2DCB6]" placeholder="0" />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-[#778873]">Supplier</label>
             <input value={newItem.supplier} onChange={(e) => setNewItem({...newItem, supplier: e.target.value})} type="text" className="w-full px-4 py-2.5 rounded-xl border border-[#D2DCB6]" placeholder="PT..." />
          </div>
           <div className="flex items-end">
             <button onClick={handleSubmit} disabled={submitting} className="w-full py-2.5 bg-[#A1BC98] text-white rounded-xl font-bold hover:bg-[#8FAC86] disabled:opacity-50">
               {submitting ? <Loader2 className="animate-spin mx-auto"/> : (editingId ? 'Simpan Perubahan' : 'Simpan Data')}
             </button>
           </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-[#E3E9D5] shadow-sm overflow-auto">
        <table className="w-full text-left">
           <thead className="bg-[#F8FAF7] text-[#778873] text-sm font-semibold sticky top-0">
             <tr><th className="p-5">Tanggal</th><th className="p-5">Supplier</th><th className="p-5">Barang</th><th className="p-5">Jumlah</th></tr>
           </thead>
           <tbody className="divide-y divide-[#F1F3E0]">
             {items.map((item, i) => (
                <tr key={i} className="hover:bg-[#FAFCF9]">
                    <td className="p-5 text-sm">{item.created_at?.split('T')[0] || '-'}</td>
                    <td className="p-5 font-medium">{item.supplier}</td>
                    <td className="p-5">{item.bahan?.nama || `Bahan #${item.bahan_id}`}</td>
                    <td className="p-5 font-bold text-[#A1BC98]">+{item.jumlah}</td>
                    <td className="p-5">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="px-3 py-1 rounded bg-yellow-100 text-yellow-800">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="px-3 py-1 rounded bg-red-50 text-red-600">Hapus</button>
                      </div>
                    </td>
                </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};
export default BarangMasukView;