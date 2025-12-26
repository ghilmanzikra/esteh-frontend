import React, { useEffect, useState } from 'react';
import { Clock, Receipt, ChevronDown, ChevronUp, Search, Calendar } from 'lucide-react';
import { api } from '../../services/api';

const RiwayatView = () => {
    const [transaksi, setTransaksi] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // summary
    const [todayCount, setTodayCount] = useState(0);
    const [todayOmzet, setTodayOmzet] = useState(0);

    const fetchRiwayat = async () => {
        try {
            setLoading(true);
            const res = await api.getTransaksi() as any;
            const data = Array.isArray(res) ? res : res.data || [];
            // Sort dari yang terbaru
            const sortedData = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setTransaksi(sortedData);

            // compute today's summary
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1);
            const todayList = sortedData.filter((t: any) => {
                const dt = new Date(t.created_at || t.tanggal);
                return dt >= startOfDay && dt < endOfDay;
            });
            setTodayCount(todayList.length);
            setTodayOmzet(todayList.reduce((s: number, it: any) => s + Number(it.total_harga || 0), 0));
        } catch (error) {
            console.error("Gagal ambil riwayat:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRiwayat();

        const handler = () => fetchRiwayat();
        window.addEventListener('transaksi:created', handler as EventListener);
        return () => window.removeEventListener('transaksi:created', handler as EventListener);
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const cancelTransaction = async (id: number) => {
        if (!confirm('Yakin batalkan transaksi ini?')) return;
        try {
                await api.deleteTransaksi(id);
                alert('Transaksi dibatalkan dan stok dikembalikan.');
                // inform other views to refresh stok / availability
                window.dispatchEvent(new CustomEvent('transaksi:deleted'));
                fetchRiwayat();
        } catch (error) {
            console.error('Gagal batalkan transaksi:', error);
            alert('Gagal batalkan transaksi');
        }
    };

    // Format Tanggal Cantik
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    if (loading) return <div className="p-10 text-center text-[#A1BC98]">Memuat riwayat...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 flex items-center gap-2 text-gray-400">
                    <Calendar size={18} />
                    <span className="text-sm">Filter Tanggal</span>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-sm">
                        <div className="text-xs text-gray-500">Transaksi Hari Ini</div>
                        <div className="font-bold text-[#2C3E2D]">{todayCount} order</div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-sm">
                        <div className="text-xs text-gray-500">Omset Hari Ini</div>
                        <div className="font-bold text-[#2C3E2D]">Rp {todayOmzet.toLocaleString('id-ID')}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {transaksi.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed text-gray-400">
                        Belum ada riwayat transaksi.
                    </div>
                ) : (
                    transaksi.map((trx) => (
                        <div key={trx.id} className="bg-white rounded-2xl shadow-sm border border-[#E8ECE8] overflow-hidden hover:shadow-md transition-shadow">
                            {/* Header Transaksi */}
                            <div 
                                onClick={() => toggleExpand(trx.id)}
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#E8F5E9] text-[#4A5347] rounded-full">
                                        <Receipt size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#2C3E2D]">Order #{trx.id}</h4>
                                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                                        <Clock size={12} />
                                                                        <span>{formatDate(trx.created_at || trx.tanggal)}</span>
                                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                                        <span className="uppercase font-semibold text-[#A1BC98]">{(trx.metode_bayar || trx.metode || '').toString()}</span>
                                                                    </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">Total Transaksi</p>
                                        <p className="font-bold text-lg text-[#2C3E2D]">Rp {Number(trx.total || trx.total_harga || trx.total_harga || 0).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); cancelTransaction(trx.id); }} className="text-red-500 text-sm px-3 py-1 rounded-md border border-red-100 bg-red-50">Batalkan</button>
                                        {expandedId === trx.id ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                                    </div>
                                </div>
                            </div>

                            {/* Detail Items (Expanded) */}
                            {expandedId === trx.id && (
                                <div className="bg-[#F9FAF9] p-5 border-t border-gray-100 animate-in slide-in-from-top-2">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase mb-3">Rincian Item</h5>
                                    <div className="space-y-2">
                                        {(trx.item_transaksi || trx.items || []).map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[#4A5347]">{item.quantity}x</span>
                                                    <span className="text-gray-600">{item.produk?.nama || item.nama || 'Produk Terhapus'}</span>
                                                </div>
                                                <span className="text-gray-500">Rp {Number(item.subtotal || item.harga || 0).toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}
                                    </div>
                                    { (trx.bukti_qris || trx.bukti) && (
                                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                                            <p className="text-xs font-bold text-gray-400 mb-2">Bukti Pembayaran</p>
                                            <a href={trx.bukti_qris || trx.bukti} target="_blank" rel="noreferrer" className="text-xs text-blue-500 underline">Lihat Bukti Foto</a>
                                            <div className="mt-2">
                                                <img src={trx.bukti_qris || trx.bukti} alt="Bukti QRIS" className="max-w-xs rounded-md border" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RiwayatView;