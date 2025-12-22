import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Save, X, Coffee } from 'lucide-react';
import { api } from '../../services/api';

// Interface lokal agar aman
interface StokOutletItem {
    id: number;
    bahan_id: number;
    stok: number;
    bahan?: {
        id: number;
        nama: string;
        satuan: string;
    };
    nama?: string; // Fallback
    satuan?: string; // Fallback
}

interface KomposisiInput {
  bahan_id: number;
  quantity: number;
}

interface Produk {
  id: number;
  nama: string;
  harga: number;
  image_url?: string;
  komposisi?: any[];
}

const ProdukView = () => {
  const [products, setProducts] = useState<Produk[]>([]);
  const [bahanOptions, setBahanOptions] = useState<StokOutletItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Form State
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [gambar, setGambar] = useState<File | null>(null);
  
  const [komposisiList, setKomposisiList] = useState<KomposisiInput[]>([
    { bahan_id: 0, quantity: 0 }
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resProduk = await api.getProduk() as any;
      const dataProduk = Array.isArray(resProduk) ? resProduk : resProduk.data || [];
      setProducts(dataProduk);

      const resStok = await api.getStokOutlet() as any;
      const dataStok = Array.isArray(resStok) ? resStok : resStok.data || [];
      setBahanOptions(dataStok);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGambar(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
      setGambar(null);
      setPreviewImage(null);
  }

  const addKomposisiRow = () => {
    setKomposisiList([...komposisiList, { bahan_id: 0, quantity: 0 }]);
  };

  const removeKomposisiRow = (index: number) => {
    const newList = [...komposisiList];
    newList.splice(index, 1);
    setKomposisiList(newList);
  };

  const handleKomposisiChange = (index: number, field: keyof KomposisiInput, value: number) => {
    const newList = [...komposisiList];
    // @ts-ignore
    newList[index][field] = value;
    setKomposisiList(newList);
  };

  // Handler Tombol Batal / Close
  const handleCloseModal = () => {
      resetForm(); // Reset form dulu
      setIsModalOpen(false); // Baru tutup modal
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama || !harga) {
      alert("Nama dan Harga wajib diisi!");
      return;
    }

    const validKomposisi = komposisiList.filter(k => k.bahan_id !== 0 && k.quantity > 0);
    
    if (validKomposisi.length === 0) {
      alert("Minimal masukkan 1 bahan baku untuk komposisi!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nama', nama);
      formData.append('harga', harga);
      
      // Foto sekarang OPSIONAL. Hanya append jika ada.
      if (gambar) {
        formData.append('image', gambar); // Mobile pakai key 'image' biasanya, cek backend
      }

      // Logika Komposisi Array untuk Backend Laravel/Node umumnya:
      validKomposisi.forEach((item, index) => {
        formData.append(`komposisi[${index}][bahan_id]`, item.bahan_id.toString());
        formData.append(`komposisi[${index}][quantity]`, item.quantity.toString());
      });

      console.log("Sending Form Data...");
      await api.createProduk(formData);
      
      alert("Produk berhasil dibuat! 🎉");
      handleCloseModal(); // Reset & Close
      fetchData(); 

    } catch (error: any) {
      console.error("Gagal create produk:", error);
      alert("Gagal membuat produk: " + (error.message || "Unknown Error"));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin hapus produk ini?")) {
      try {
        await api.deleteProduk(id);
        fetchData();
      } catch (error) {
        console.error(error);
        alert("Gagal hapus produk");
      }
    }
  };

  const resetForm = () => {
    setNama('');
    setHarga('');
    setGambar(null);
    setPreviewImage(null);
    setKomposisiList([{ bahan_id: 0, quantity: 0 }]);
  };

  // Helper aman untuk nama bahan
  const getBahanName = (bahan: any) => {
      if (!bahan) return 'Unknown';
      return bahan.nama || (bahan.bahan ? bahan.bahan.nama : 'Unknown');
  };
  
  const getBahanSatuan = (bahan: any) => {
      if (!bahan) return '';
      return bahan.satuan || (bahan.bahan ? bahan.bahan.satuan : '');
  };

  return (
    <div className="p-6 min-h-screen bg-[#F5F7F5]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3E2D]">Kelola Menu</h1>
          <p className="text-[#5A6C5B]">Atur produk dan resep minuman</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#4A5347] text-white rounded-xl shadow-lg hover:bg-[#2C3E2D] transition-all transform active:scale-95"
        >
          <Plus size={20} />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* GRID PRODUK */}
      {loading ? (
        <div className="flex justify-center p-10"><span className="loading loading-spinner text-[#4A5347]"></span></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((produk) => (
            <div key={produk.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-[#E8ECE8] flex flex-col">
              <div className="h-48 rounded-xl bg-[#F5F7F5] mb-4 overflow-hidden relative group">
                {produk.image_url ? (
                   <img src={produk.image_url} alt={produk.nama} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400">
                     <Coffee size={40} />
                   </div>
                )}
                <button 
                  onClick={() => handleDelete(produk.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <h3 className="font-bold text-lg text-[#2C3E2D] mb-1">{produk.nama}</h3>
              <p className="text-[#A1BC98] font-bold">Rp {Number(produk.harga).toLocaleString('id-ID')}</p>
              
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Komposisi Utama:</p>
                <div className="flex flex-wrap gap-1">
                  {produk.komposisi?.slice(0, 3).map((k: any, idx: number) => (
                    <span key={idx} className="text-[10px] px-2 py-1 bg-[#F5F7F5] text-[#5A6C5B] rounded-md border border-[#E8ECE8]">
                      {k.bahan?.nama || 'Bahan'}
                    </span>
                  ))}
                  {(produk.komposisi?.length || 0) > 3 && (
                    <span className="text-[10px] px-2 py-1 text-gray-400">+{(produk.komposisi?.length || 0) - 3} lainnya</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-[#2C3E2D]">Buat Menu Baru</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-sm font-semibold text-[#5A6C5B]">Foto Menu <span className="text-gray-400 font-normal">(Opsional)</span></label>
                        {previewImage && <button type="button" onClick={removeImage} className="text-xs text-red-500 hover:underline">Hapus Foto</button>}
                    </div>
                    <div className="relative group">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center transition-all ${previewImage ? 'border-[#A1BC98] bg-[#F5F7F5]' : 'border-gray-300 hover:border-[#A1BC98]'}`}>
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <>
                                    <div className="p-3 bg-gray-50 rounded-full mb-2 group-hover:bg-[#E8F5E9] transition-colors">
                                        <ImageIcon size={24} className="text-gray-400 group-hover:text-[#A1BC98]" />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">Klik untuk upload foto</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#5A6C5B]">Nama Menu</label>
                        <input 
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            placeholder="Contoh: Es Teh Leci"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#A1BC98] focus:ring-2 focus:ring-[#A1BC98]/20 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#5A6C5B]">Harga Jual (Rp)</label>
                        <input 
                            type="number"
                            value={harga}
                            onChange={(e) => setHarga(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#A1BC98] focus:ring-2 focus:ring-[#A1BC98]/20 outline-none transition-all font-mono"
                        />
                    </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold text-[#2C3E2D]">Komposisi Resep</h3>
                        <p className="text-xs text-gray-400">Tentukan bahan baku yang terpakai per 1 porsi</p>
                    </div>
                    <button 
                        type="button" 
                        onClick={addKomposisiRow}
                        className="text-xs font-bold text-[#A1BC98] hover:text-[#8FAC86] flex items-center gap-1 px-3 py-1.5 bg-[#E8F5E9] rounded-lg transition-colors"
                    >
                        <Plus size={14} /> Tambah Bahan
                    </button>
                </div>

                <div className="space-y-3 bg-[#F9FAF9] p-4 rounded-xl border border-[#E8ECE8]">
                    {komposisiList.map((item, index) => (
                        <div key={index} className="flex items-end gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                            <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-bold text-[#778873] uppercase tracking-wide">Bahan Baku</label>
                                <select 
                                    value={item.bahan_id}
                                    onChange={(e) => handleKomposisiChange(index, 'bahan_id', Number(e.target.value))}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#A1BC98] outline-none"
                                >
                                    <option value={0}>Pilih Bahan...</option>
                                    {bahanOptions.map((bahan: any) => (
                                        <option key={bahan.id || bahan.bahan_id} value={bahan.bahan_id || bahan.id}>
                                            {getBahanName(bahan)} ({getBahanSatuan(bahan)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-24 space-y-1">
                                <label className="text-[10px] font-bold text-[#778873] uppercase tracking-wide">Takaran</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    value={item.quantity === 0 ? '' : item.quantity}
                                    onChange={(e) => handleKomposisiChange(index, 'quantity', parseFloat(e.target.value))}
                                    placeholder="0"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#A1BC98] outline-none text-center"
                                />
                            </div>
                            <button 
                                type="button"
                                onClick={() => removeKomposisiRow(index)}
                                className="mb-[5px] p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {komposisiList.length === 0 && (
                        <p className="text-center text-xs text-gray-400 py-2">Belum ada komposisi. Klik Tambah Bahan.</p>
                    )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 text-sm font-bold text-[#5A6C5B] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                    Batal
                </button>
                <button 
                    type="submit"
                    className="flex-[2] flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold text-white bg-[#4A5347] rounded-xl hover:bg-[#2C3E2D] shadow-lg shadow-[#4A5347]/20 transition-all active:scale-95"
                >
                    <Save size={18} />
                    Simpan Produk
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdukView;