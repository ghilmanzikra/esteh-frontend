import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Loader2, Save, X } from 'lucide-react';
import { api } from '../../services/api';
import { Produk } from '../../types';

const ProdukView = () => {
  const [products, setProducts] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form (Gambar dipisah karena tipe File)
  const [formData, setFormData] = useState({
    nama: '',
    harga: '',
    kategori: 'Signature', // Default category
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 1. Fetch Produk
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProduk();
      console.log("🔥 DATA PRODUK:", res);
      
      // Handle response array/wrapped
      if (Array.isArray(res)) setProducts(res);
      // @ts-ignore
      else if (res.data && Array.isArray(res.data)) setProducts(res.data);
      else setProducts([]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Handlers
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ nama: '', harga: '', kategori: 'Signature' });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Produk) => {
    setIsEditMode(true);
    setSelectedId(prod.id);
    setFormData({
      nama: prod.nama,
      harga: prod.harga.toString(),
      kategori: prod.kategori || 'Signature'
    });
    setImageFile(null); // Reset file input
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus menu ini?')) return;
    try {
      await api.deleteProduk(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert("Gagal hapus: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('nama', formData.nama);
      payload.append('harga', formData.harga);
      // payload.append('kategori', formData.kategori); // Uncomment jika backend butuh

      if (imageFile) {
        payload.append('gambar', imageFile);
      }

      // --- PERBAIKAN DI SINI ---
      // Kita coba kirim komposisi dengan format array index agar backend membacanya sebagai array
      // Data dummy: bahan_id=1, quantity=1
      payload.append('komposisi[0][bahan_id]', '1');
      payload.append('komposisi[0][quantity]', '1');

      // Kalau backend ternyata maunya 'komposisi' sebagai JSON string tapi dia lupa decode,
      // opsi lain adalah minta temanmu ubah validasi backend.
      // Tapi kita coba cara array index di atas dulu.

      if (isEditMode && selectedId) {
         // Khusus PUT dengan FormData, kadang backend framework (seperti Laravel) butuh trik '_method'
         // payload.append('_method', 'PUT'); 
         // await api.createProduk(payload); // Kirim ke POST tapi dianggep PUT
         
         // Kita coba cara normal dulu:
         await api.updateProduk(selectedId, payload); 
      } else {
         await api.createProduk(payload);
      }
      
      setIsModalOpen(false);
      fetchProducts();
      alert("Berhasil menyimpan menu!");

    } catch (err: any) {
      console.error(err);
      // Tampilkan detail error validasi jika ada
      const msg = err.message || "Gagal simpan data";
      alert(`Gagal: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E3E9D5] overflow-hidden flex flex-col h-full relative">
      
      {/* Header */}
      <div className="p-6 border-b border-[#F1F3E0] flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-[#4A5347]">Daftar Menu Outlet</h2>
          <p className="text-sm text-[#778873]">Kelola varian minuman dan harga</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-[#A1BC98] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#8FAC86] transition-colors shadow-lg shadow-[#A1BC98]/20">
          <Plus size={18} /> Tambah Menu
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
            <div className="p-10 text-center text-[#778873]">Loading menu...</div>
        ) : (
            <table className="w-full text-left">
            <thead className="bg-[#F8FAF7] text-[#778873] font-semibold text-sm sticky top-0 z-10">
                <tr>
                <th className="p-5 pl-8">Foto</th>
                <th className="p-5">Nama Produk</th>
                <th className="p-5">Harga</th>
                <th className="p-5 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3E0]">
                {products.map(product => (
                <tr key={product.id} className="hover:bg-[#FAFCF9] transition-colors group">
                    <td className="p-5 pl-8">
                    <div className="w-12 h-12 rounded-lg bg-[#E3E9D5] flex items-center justify-center text-white overflow-hidden">
                        {product.gambar ? (
                            <img src={product.gambar} alt={product.nama} className="w-full h-full object-cover"/>
                        ) : (
                            <ImageIcon size={20} />
                        )}
                    </div>
                    </td>
                    <td className="p-5 font-bold text-[#4A5347]">{product.nama}</td>
                    <td className="p-5 font-medium text-[#4A5347]">Rp {product.harga.toLocaleString()}</td>
                    <td className="p-5 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(product)} className="p-2 rounded-lg hover:bg-[#F1F3E0] text-[#A1BC98] transition-colors">
                        <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg hover:bg-[#F5B8B8]/20 text-[#F5B8B8] transition-colors">
                        <Trash2 size={18} />
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#4A5347]">{isEditMode ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="text-[#778873]" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#4A5347] mb-1">Nama Menu</label>
                        <input type="text" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#4A5347] mb-1">Harga (Rp)</label>
                        <input type="number" required value={formData.harga} onChange={e => setFormData({...formData, harga: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#4A5347] mb-1">Foto Produk</label>
                        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-[#778873]" />
                    </div>
                    
                    <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#A1BC98] text-white rounded-xl font-bold mt-4 flex justify-center items-center gap-2">
                        {isSubmitting && <Loader2 className="animate-spin" size={18} />} Simpan
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProdukView;