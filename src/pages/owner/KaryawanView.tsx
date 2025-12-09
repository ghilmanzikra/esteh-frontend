import React, { useEffect, useState } from 'react';
import { Mail, Shield, MoreVertical, Plus, User as UserIcon, Loader2, AlertCircle, Store, X, Save, Trash2, Edit, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { User, Outlet } from '../../types';

const KaryawanView = () => {
  // --- STATE DATA ---
  const [employees, setEmployees] = useState<User[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]); // Kita butuh data outlet buat dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- STATE MODAL & FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'karyawan',
    outlet_id: '' // String dulu biar bisa handle select kosong
  });

  // --- STATE FEEDBACK ---
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });

  // 1. FETCH DATA (Employees + Outlets)
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Kita fetch paralel biar cepat
      const [empRes, outletRes] = await Promise.all([
        api.getUsers(),
        api.getOutlets()
      ]);

      console.log("🔥 DATA EMPLOYEES:", empRes);
      
      // Handle Employees Data
      if (Array.isArray(empRes)) {
         // @ts-ignore
         setEmployees(empRes);
      } else if (empRes.data && Array.isArray(empRes.data)) {
         setEmployees(empRes.data);
      } else {
         setEmployees([]);
      }

      // Handle Outlets Data (Buat Dropdown)
      if (Array.isArray(outletRes)) {
         // @ts-ignore
         setOutlets(outletRes);
      } else if (outletRes.data && Array.isArray(outletRes.data)) {
         setOutlets(outletRes.data);
      }

    } catch (err: any) {
      console.error(err);
      setError('Gagal memuat data. Cek koneksi server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. HANDLERS MODAL
  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ username: '', password: '', role: 'karyawan', outlet_id: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setIsEditMode(true);
    setSelectedId(user.id);
    setFormData({
      username: user.username,
      password: '', // Password dikosongkan saat edit (opsional diisi user)
      role: user.role,
      outlet_id: user.outlet_id ? user.outlet_id.toString() : ''
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

    // --- LOGIKA CERDAS: SIAPKAN PAYLOAD ---
    // Kita buat object payload dasar dulu
    const payload: any = {
        username: formData.username,
        role: formData.role,
        outlet_id: formData.outlet_id ? parseInt(formData.outlet_id) : null
    };

    // KHUSUS EDIT: Hanya kirim password jika user mengetik sesuatu (tidak kosong)
    // KHUSUS CREATE: Password wajib dikirim (sudah dicek di validasi required input)
    if (formData.password) {
        payload.password = formData.password;
    }

    try {
      if (isEditMode && selectedId) {
        // --- UPDATE ---
        // Kirim payload yang sudah disaring (tanpa password kosong)
        await api.updateUser(selectedId, payload);
        triggerSuccess("Data karyawan berhasil diperbarui!");
      } else {
        // --- CREATE ---
        await api.createUser(payload);
        triggerSuccess("Pegawai baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      fetchData(); // Refresh list dari server
    } catch (err: any) {
      console.error(err); // Log error biar kelihatan di console
      // Tampilkan pesan error spesifik dari backend jika ada
      alert(err.message || "Gagal menyimpan data. Pastikan input valid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    try {
      await api.deleteUser(selectedId);
      setEmployees(prev => prev.filter(u => u.id !== selectedId));
      setShowDeleteConfirm(false);
      triggerSuccess("Akun karyawan dihapus.");
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  const triggerSuccess = (msg: string) => {
    setShowSuccess({ show: true, msg });
    setTimeout(() => setShowSuccess({ show: false, msg: '' }), 2500);
  };

  // Helper Warna Role
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner': return 'bg-[#4A5347] text-white';
      case 'gudang': return 'bg-[#A1BC98] text-white';
      case 'supervisor': return 'bg-[#FDCB6E] text-[#4A5347]';
      default: return 'bg-[#E3E9D5] text-[#4A5347]'; 
    }
  };

  // Helper Nama Outlet
  const renderOutletLocation = (emp: User) => {
    if (['owner', 'supervisor', 'gudang'].includes(emp.role)) {
      return <span className="text-xs text-[#778873] italic flex items-center gap-1"><Store size={12} /> Kantor Pusat</span>;
    }
    if (emp.outlet) {
      return <span className="font-medium text-[#4A5347]">{emp.outlet.nama}</span>;
    }
    return <span className="text-red-400 text-xs">Belum ditempatkan</span>;
  };

  if (loading) return <div className="p-10 text-center text-[#778873] flex flex-col items-center gap-2"><Loader2 className="animate-spin text-[#A1BC98]"/> Memuat data SDM...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-[#E3E9D5] shadow-sm overflow-hidden relative">
      
      {/* HEADER */}
      <div className="p-6 border-b border-[#F1F3E0] flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-bold text-xl text-[#4A5347]">Data Karyawan</h2>
          <p className="text-sm text-[#778873]">Total {employees.length} akun terdaftar</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#A1BC98] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#A1BC98]/20 hover:bg-[#8FAC86] transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={18} /> Tambah Pegawai
        </button>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAF7] text-[#778873] text-sm font-semibold sticky top-0 z-10">
            <tr>
              <th className="p-5 pl-8">Username / Akun</th>
              <th className="p-5">Role / Jabatan</th>
              <th className="p-5">Penempatan (Outlet)</th>
              <th className="p-5 text-center">Status</th>
              <th className="p-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F3E0]">
            {employees.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-[#778873] italic">Belum ada data karyawan.</td></tr>
            ) : (
                employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#FAFCF9] transition-colors group">
                    <td className="p-5 pl-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E3E9D5] flex items-center justify-center text-[#A1BC98] font-bold uppercase shadow-sm">
                        {emp.username.charAt(0)}
                        </div>
                        <div>
                        <h4 className="font-bold text-[#4A5347] text-sm">{emp.username}</h4>
                        <p className="text-xs text-[#778873] flex items-center gap-1">
                            <UserIcon size={10} /> ID: {emp.id}
                        </p>
                        </div>
                    </div>
                    </td>
                    <td className="p-5">
                    <span className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg w-fit uppercase ${getRoleBadgeColor(emp.role)}`}>
                        <Shield size={12} /> {emp.role}
                    </span>
                    </td>
                    <td className="p-5 text-sm text-[#778873] font-medium">
                        {renderOutletLocation(emp)}
                    </td>
                    <td className="p-5 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B8E6B8]/30 text-[#2d5a2d] border border-[#B8E6B8]">
                        Active
                    </span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => openEditModal(emp)}
                          className="p-2 hover:bg-[#F1F3E0] rounded-lg text-[#A1BC98] transition-colors" title="Edit User"
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(emp.id)}
                          className="p-2 hover:bg-[#F5B8B8]/20 rounded-lg text-[#FF7675] transition-colors" title="Hapus User"
                        >
                            <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#4A5347]">
                {isEditMode ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#F1F3E0] rounded-full text-[#778873]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#4A5347] mb-1">Username</label>
                <input 
                  type="text" 
                  required
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D2DCB6] focus:outline-none focus:border-[#A1BC98]"
                  placeholder="Username untuk login"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#4A5347] mb-1">
                  {isEditMode ? 'Password Baru (Opsional)' : 'Password'}
                </label>
                <input 
                  type="text" 
                  required={!isEditMode} // Wajib jika tambah baru
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D2DCB6] focus:outline-none focus:border-[#A1BC98]"
                  placeholder={isEditMode ? "Isi jika ingin mengganti password" : "Password untuk login"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-[#4A5347] mb-1">Role / Jabatan</label>
                    <select
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D2DCB6] focus:outline-none focus:border-[#A1BC98] bg-white text-[#4A5347]"
                    >
                        <option value="karyawan">Karyawan</option>
                        <option value="gudang">Gudang</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="owner">Owner</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-[#4A5347] mb-1">Penempatan</label>
                    <select
                        value={formData.outlet_id}
                        onChange={e => setFormData({...formData, outlet_id: e.target.value})}
                        disabled={formData.role === 'owner' || formData.role === 'gudang'}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D2DCB6] focus:outline-none focus:border-[#A1BC98] bg-white text-[#4A5347] disabled:bg-[#F1F3E0]"
                    >
                        <option value="">-- Pilih Outlet --</option>
                        {outlets.map(out => (
                            <option key={out.id} value={out.id}>{out.nama}</option>
                        ))}
                    </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-[#D2DCB6] text-[#778873] rounded-xl font-bold hover:bg-[#F1F3E0]">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-[#A1BC98] text-white rounded-xl font-bold hover:bg-[#8FAC86] disabled:opacity-70 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DELETE --- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border-t-4 border-[#FF7675]">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FF7675]/10 rounded-full flex items-center justify-center mb-4 text-[#FF7675]">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#4A5347] mb-2">Hapus Akun Ini?</h3>
              <p className="text-sm text-[#778873] mb-6">
                Tindakan ini tidak dapat dibatalkan. User tidak akan bisa login lagi.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 border border-[#D2DCB6] text-[#778873] rounded-xl font-bold hover:bg-[#F1F3E0]">
                  Batal
                </button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-3 bg-[#FF7675] text-white rounded-xl font-bold hover:bg-red-500 shadow-lg shadow-red-200">
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST SUKSES --- */}
      {showSuccess.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-10 duration-300">
          <div className="bg-[#4A5347] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#A1BC98]">
            <div className="bg-[#A1BC98] rounded-full p-1"><CheckCircle size={20} className="text-white" /></div>
            <span className="font-medium text-sm">{showSuccess.msg}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default KaryawanView;