import React, { useEffect, useState } from 'react';
import { Store, MapPin, Edit, Trash2, Plus, Loader2, AlertCircle, X, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { Outlet } from '../../types';

const OutletView = () => {
  // --- STATE DATA ---
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- STATE MODAL & FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Penanda sedang edit atau tambah
  const [selectedId, setSelectedId] = useState<number | null>(null); // ID outlet yang sedang diedit/hapus
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    is_active: true
  });

  // --- STATE FEEDBACK POPUP ---
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Modal konfirmasi hapus
  const [showSuccess, setShowSuccess] = useState<{show: boolean, msg: string}>({ show: false, msg: '' }); // Modal sukses

  // 1. FETCH DATA
  const fetchOutlets = async () => {
    try {
      setLoading(true);
      const response = await api.getOutlets();
      if (Array.isArray(response)) {
          // @ts-ignore
          setOutlets(response);
      } else if (response.data && Array.isArray(response.data)) {
          setOutlets(response.data);
      } else {
          setOutlets([]);
      }
    } catch (err: any) {
      setError('Gagal memuat data outlet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  // 2. HANDLERS BUKA MODAL
  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ nama: '', alamat: '', is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (outlet: Outlet) => {
    setIsEditMode(true);
    setSelectedId(outlet.id);
    setFormData({
      nama: outlet.nama,
      alamat: outlet.alamat,
      is_active: outlet.is_active
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  // 3. ACTION HANDLERS (CRUD)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode && selectedId) {
        // --- LOGIKA UPDATE ---
        await api.updateOutlet(selectedId, formData);
        triggerSuccess("Data outlet berhasil diperbarui!");
      } else {
        // --- LOGIKA CREATE ---
        await api.createOutlet(formData);
        triggerSuccess("Outlet baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      fetchOutlets(); // Refresh data
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    try {
      await api.deleteOutlet(selectedId);
      setOutlets(prev => prev.filter(o => o.id !== selectedId)); // Optimistic update
      setShowDeleteConfirm(false);
      triggerSuccess("Outlet berhasil dihapus permanen.");
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  // Helper untuk memunculkan popup sukses sejenak
  const triggerSuccess = (msg: string) => {
    setShowSuccess({ show: true, msg });
    setTimeout(() => setShowSuccess({ show: false, msg: '' }), 2500); // Hilang dalam 2.5 detik
  };


  // --- RENDER COMPONENT ---
  if (loading) return <div className="p-10 text-center text-[#778873] flex flex-col items-center gap-2"><Loader2 className="animate-spin text-[#A1BC98]"/> Mengambil data...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full gap-6 relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#E3E9D5] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#4A5347]">Data Outlet</h2>
          <p className="text-sm text-[#778873]">Total {outlets.length} cabang terdaftar</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#A1BC98] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#A1BC98]/20 hover:bg-[#8FAC86] transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={18} /> Tambah Outlet
        </button>
      </div>

      {/* GRID OUTLET */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {outlets.map(outlet => (
          <div key={outlet.id} className="bg-white p-6 rounded-3xl border border-[#E3E9D5] shadow-sm hover:border-[#A1BC98] transition-all group relative overflow-hidden flex flex-col">
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-xs font-bold ${outlet.is_active ? 'bg-[#A1BC98] text-white' : 'bg-[#FF7675] text-white'}`}>
              {outlet.is_active ? 'Aktif' : 'Non-Aktif'}
            </div>
            
            <div className="w-14 h-14 bg-[#F1F3E0] rounded-2xl flex items-center justify-center text-[#A1BC98] mb-4">
              <Store size={28} />
            </div>
            
            <h3 className="font-bold text-[#4A5347] text-lg mb-1">{outlet.nama}</h3>
            
            <p className="text-xs text-[#778873] font-medium bg-[#F8FAF7] px-2 py-1 rounded w-fit mb-4">
              ID: #{outlet.id}
            </p> 
            
            <div className="space-y-2 mb-6 flex-1">
              <div className="flex items-start gap-3 text-sm text-[#778873]">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{outlet.alamat}</span>
              </div>
            </div>

            <div className="flex gap-2 border-t border-[#F1F3E0] pt-4 mt-auto">
              <button 
                onClick={() => openEditModal(outlet)}
                className="flex-1 py-2 bg-[#F1F3E0] text-[#4A5347] rounded-xl text-sm font-bold hover:bg-[#A1BC98] hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={14} /> Edit
              </button>
              <button 
                onClick={() => openDeleteModal(outlet.id)}
                className="p-2 bg-[#F5B8B8]/20 text-[#FF7675] rounded-xl hover:bg-[#FF7675] hover:text-white transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL FORM (TAMBAH / EDIT) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#4A5347]">
                {isEditMode ? 'Edit Data Cabang' : 'Tambah Cabang Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#F1F3E0] rounded-full text-[#778873]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#4A5347] mb-1">Nama Outlet</label>
                <input 
                  type="text" 
                  required
                  value={formData.nama}
                  onChange={e => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D2DCB6] focus:outline-none focus:border-[#A1BC98]"
                  placeholder="Contoh: Outlet Sudirman"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4A5347] mb-1">Alamat Lengkap</label>
                <textarea 
                  required
                  value={formData.alamat}
                  onChange={e => setFormData({...formData, alamat: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D2DCB6] focus:outline-none focus:border-[#A1BC98] h-24 resize-none"
                  placeholder="Jl. Jenderal Sudirman No..."
                />
              </div>
              <div className="flex items-center gap-2 bg-[#F8FAF7] p-3 rounded-xl border border-[#D2DCB6]">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="w-5 h-5 accent-[#A1BC98] cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm text-[#4A5347] font-medium cursor-pointer select-none">
                  Status Aktif (Buka)
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-[#D2DCB6] text-[#778873] rounded-xl font-bold hover:bg-[#F1F3E0]"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#A1BC98] text-white rounded-xl font-bold hover:bg-[#8FAC86] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} />}
                  {isEditMode ? 'Simpan Perubahan' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS (MERAH ELEGANT) --- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border-t-4 border-[#FF7675]">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FF7675]/10 rounded-full flex items-center justify-center mb-4 text-[#FF7675]">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#4A5347] mb-2">Hapus Outlet Ini?</h3>
              <p className="text-sm text-[#778873] mb-6">
                Tindakan ini tidak dapat dibatalkan. Semua data terkait outlet ini mungkin akan hilang.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 border border-[#D2DCB6] text-[#778873] rounded-xl font-bold hover:bg-[#F1F3E0]"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 bg-[#FF7675] text-white rounded-xl font-bold hover:bg-red-500 shadow-lg shadow-red-200"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL SUKSES (HIJAU CANTIK) --- */}
      {showSuccess.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-10 duration-300">
          <div className="bg-[#4A5347] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#A1BC98]">
            <div className="bg-[#A1BC98] rounded-full p-1">
              <CheckCircle size={20} className="text-white" />
            </div>
            <span className="font-medium text-sm">{showSuccess.msg}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default OutletView;