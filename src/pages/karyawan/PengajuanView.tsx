import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const PengajuanView = () => {
  const [activeTab, setActiveTab] = useState<'pengajuan'|'proses'|'riwayat'>('pengajuan');
  const [bahanGudang, setBahanGudang] = useState<any[]>([]);
  const [forbiddenBahan, setForbiddenBahan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [qty, setQty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // history / permintaan
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  const fetchBahan = async () => {
    try {
      setLoading(true);
      // Ambil list bahan dari gudang untuk karyawan
      const res = await api.getBahanGudang();
      const data = Array.isArray(res) ? res : res.data || [];
      setBahanGudang(data);
      setForbiddenBahan(false);
    } catch (e) {
      console.error('Gagal ambil bahan gudang', e);
      // Jika server menolak akses (role tidak diizinkan), tampilkan pesan
      const msg = (e as any)?.message || '';
      if (typeof msg === 'string' && (msg.toLowerCase().includes('akses ditolak') || msg.toLowerCase().includes('role'))) {
        setForbiddenBahan(true);
        // fallback: coba ambil stok outlet yang mungkin bisa diakses oleh karyawan
        try {
          const fallback = await api.getStokOutlet();
          setBahanGudang(Array.isArray(fallback) ? fallback : (fallback.data || []));
        } catch (fe) {
          console.error('Fallback stok outlet gagal', fe);
          setBahanGudang([]);
        }
      } else {
        setBahanGudang([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.getPermintaanStok();
      const data = Array.isArray(res) ? res : res.data || [];
      setHistory(data.sort((a: any,b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e) {
      console.error('Gagal ambil history permintaan', e);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchBahan();
    fetchHistory();
    const handler = () => { fetchHistory(); fetchBahan(); };
    window.addEventListener('permintaan:created', handler as EventListener);
    window.addEventListener('transaksi:deleted', handler as EventListener);
    return () => {
      window.removeEventListener('permintaan:created', handler as EventListener);
      window.removeEventListener('transaksi:deleted', handler as EventListener);
    };
  }, []);

  const closeModal = () => { setSelected(null); setQty(''); setIsModalOpen(false); };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !qty) return;
    const jumlah = Number(qty);
    if (isNaN(jumlah) || jumlah <= 0) return alert('Masukkan jumlah valid');
    try {
      setSubmitting(true);
      if (editing) {
        // update existing permintaan
        await api.updatePermintaan(editing.id, { bahan_id: selected.id, jumlah });
        setEditing(null);
      } else {
        await api.requestStok({ bahan_id: selected.id, jumlah });
      }
      alert('Permintaan dikirim');
      closeModal();
      window.dispatchEvent(new CustomEvent('permintaan:created'));
      fetchHistory();
    } catch (err: any) {
      console.error(err);
      alert('Gagal kirim permintaan: ' + (err.message || 'Server Error'));
    } finally { setSubmitting(false); }
  };

  const openTerimaModal = (perm: any) => {
    setSelected(perm);
    setUploadFile(null);
    setIsModalOpen(true);
    setEditing(null);
  };

  const handleTerima = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      setSubmitting(true);
      const barangKeluarId = selected.barang_keluar_id || selected.barang_keluar?.id || selected.kiriman_id;
      if (!barangKeluarId) return alert('Tidak ada referensi pengiriman terkait.');
      const fd = new FormData();
      if (uploadFile) fd.append('bukti_foto', uploadFile);
      await api.terimaBarangKeluar(barangKeluarId, fd);
      // Update permintaan status to 'diterima' as well
      try { await api.updatePermintaanStatus(selected.id, 'diterima', undefined, false); } catch(_) { /* best-effort */ }
      alert('Penerimaan dikonfirmasi');
      setIsModalOpen(false);
      fetchHistory();
      window.dispatchEvent(new CustomEvent('permintaan:created'));
    } catch (err: any) {
      console.error('Gagal terima barang', err);
      alert('Gagal terima barang');
    } finally { setSubmitting(false); }
  };

  const handleEdit = (perm: any) => {
    setEditing(perm);
    setSelected({ id: perm.bahan_id ?? perm.bahan?.id, nama: perm.bahan?.nama ?? perm.bahan_nama });
    setQty(String(perm.jumlah));
    setIsModalOpen(true);
  };

  const handleCancelRequest = async (perm: any) => {
    if (!confirm('Yakin batalkan permintaan ini?')) return;
    try {
      await api.deletePermintaan(perm.id);
      alert('Permintaan dibatalkan');
      fetchHistory();
      window.dispatchEvent(new CustomEvent('permintaan:created'));
    } catch (err:any) { console.error(err); alert('Gagal batalkan'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#4A5347]">Pengajuan / Penerimaan Bahan</h2>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#E8ECE8]">
            <button onClick={() => setActiveTab('pengajuan')} className={`px-3 py-1 rounded ${activeTab==='pengajuan' ? 'bg-[#A1BC98] text-white' : 'text-[#778873]'}`}>Pengajuan</button>
            <button onClick={() => setActiveTab('proses')} className={`px-3 py-1 rounded ${activeTab==='proses' ? 'bg-[#A1BC98] text-white' : 'text-[#778873]'}`}>Proses</button>
            <button onClick={() => setActiveTab('riwayat')} className={`px-3 py-1 rounded ${activeTab==='riwayat' ? 'bg-[#A1BC98] text-white' : 'text-[#778873]'}`}>Riwayat</button>
          </div>
          <button onClick={() => { fetchBahan(); fetchHistory(); }} className="text-sm text-[#A1BC98] hover:underline">Refresh</button>
        </div>
      </div>

      {forbiddenBahan && (
        <div className="bg-yellow-50 border-l-4 border-yellow-300 p-3 rounded-lg text-yellow-900">
          <strong>Akses Gudang Terbatas:</strong> akses ke data gudang ditolak untuk akun Anda. Menampilkan stok outlet sebagai alternatif. Hubungi admin jika perlu akses lebih.
        </div>
      )}

      {activeTab === 'pengajuan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? <div className="col-span-3 text-center py-8"><Loader2 className="animate-spin mx-auto text-[#A1BC98]"/></div> : (
            bahanGudang.map(b => {
              const stok = Number(b.stok ?? 0);
              const status = stok === 0 ? 'Habis' : (stok < 50 ? 'Kritis' : 'Aman');
              const border = status === 'Aman' ? 'border-green-200' : status === 'Kritis' ? 'border-yellow-200' : 'border-red-200';
              return (
                <div key={b.id} className={`bg-white p-4 rounded-2xl border ${border} shadow-sm`}> 
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-[#2C3E2D]">{b.nama}</div>
                      <div className="text-xs text-gray-500">ID {b.id} · {b.satuan}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${status==='Aman' ? 'bg-green-100 text-green-700' : status==='Kritis' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{status}</div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-600">Stok: <span className="font-bold">{Math.max(0, stok)}</span> {b.satuan}</div>
                    <button onClick={() => { setSelected(b); setQty(''); setIsModalOpen(true); setEditing(null); }} className="bg-[#A1BC98] text-white px-3 py-1 rounded">Ajukan</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'proses' && (
        <div className="space-y-3">
          {historyLoading ? <div className="text-center py-6"><Loader2 className="animate-spin mx-auto text-[#A1BC98]"/></div> : (
            history.filter(h => { const s=(h.status||'').toString().toLowerCase(); return s==='pending' || s==='diajukan' || s==='dikirim' }).map(h => (
              <div key={h.id} className="bg-white p-4 rounded-xl border border-[#E8ECE8] flex justify-between items-center">
                <div>
                  <div className="font-semibold">{h.bahan?.nama || h.bahan_nama || 'Bahan'}</div>
                  <div className="text-xs text-gray-500">ID #{h.id} · {new Date(h.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold uppercase text-[#A1BC98]">{h.status}</div>
                  { (h.status || '').toString().toLowerCase() === 'dikirim' ? (
                    <button onClick={() => openTerimaModal(h)} className="px-3 py-1 rounded bg-[#4A5347] text-white">Terima</button>
                  ) : ( (h.status || '').toString().toLowerCase() === 'diajukan' || (h.status||'').toString().toLowerCase()==='pending' ) ? (
                    <>
                      <button onClick={() => handleEdit(h)} className="px-3 py-1 rounded bg-yellow-100 text-yellow-800">Edit</button>
                      <button onClick={() => handleCancelRequest(h)} className="px-3 py-1 rounded bg-red-50 text-red-600">Batal</button>
                    </>
                  ) : null }
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'riwayat' && (
        <div className="space-y-3">
          {historyLoading ? <div className="text-center py-6"><Loader2 className="animate-spin mx-auto text-[#A1BC98]"/></div> : (
            history.filter(h => (h.status||'').toString().toLowerCase() === 'diterima').map(h => (
              <div key={h.id} className="bg-white p-4 rounded-xl border border-[#E8ECE8]">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{h.bahan?.nama || h.bahan_nama || 'Bahan'}</div>
                    <div className="text-xs text-gray-500">Diterima: {new Date(h.updated_at || h.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-gray-600">Jumlah: <span className="font-bold">{h.jumlah}</span></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Ajukan / Edit / Terima */}
      {isModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            { editing ? <h4 className="font-bold">Edit Permintaan: {selected.nama}</h4> : selected.barang_keluar_id ? <h4 className="font-bold">Terima Pengiriman: {selected.bahan?.nama || selected.bahan_nama}</h4> : <h4 className="font-bold">Ajukan: {selected.nama}</h4> }
            <form onSubmit={ editing ? submitRequest : (selected.barang_keluar_id ? handleTerima : submitRequest) } className="space-y-3 mt-3">
              { !selected.barang_keluar_id && (
                <div>
                  <label className="text-xs text-gray-500">Jumlah</label>
                  <input value={qty} onChange={(e) => setQty(e.target.value)} className="w-full mt-1 p-2 border rounded" type="number" step="0.1" />
                </div>
              )}
              { selected.barang_keluar_id && (
                <div>
                  <label className="text-xs text-gray-500">Upload Foto Bukti (opsional)</label>
                  <input type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} className="w-full mt-1" />
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditing(null); setSelected(null); }} className="flex-1 py-2 rounded bg-gray-100">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2 rounded bg-[#4A5347] text-white">{submitting ? 'Memproses...' : (selected.barang_keluar_id ? 'Konfirmasi Terima' : (editing ? 'Simpan Perubahan' : 'Kirim Permintaan'))}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengajuanView;
