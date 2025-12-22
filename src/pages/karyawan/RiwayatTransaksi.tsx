import React, { useEffect, useState } from 'react';
import { Clock, Receipt, ChevronDown, ChevronUp, Search, Calendar } from 'lucide-react';
import { api } from '../../services/api';

const RiwayatView = () => {
    const [transaksi, setTransaksi] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const fetchRiwayat = async () => {
        try {
            setLoading(true);
            const res = await api.getTransaksi() as any;
            const data = Array.isArray(res) ? res : res.data || [];
            // Sort dari yang terbaru
            const sortedData = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setTransaksi(sortedData);
        } catch (error) {
            console.error("Gagal ambil riwayat:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRiwayat();
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
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
                                            <span className="uppercase font-semibold text-[#A1BC98]">{trx.metode_bayar}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">Total Transaksi</p>
                                        <p className="font-bold text-lg text-[#2C3E2D]">Rp {Number(trx.total_harga || 0).toLocaleString('id-ID')}</p>
                                    </div>
                                    {expandedId === trx.id ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                                </div>
                            </div>

                            {/* Detail Items (Expanded) */}
                            {expandedId === trx.id && (
                                <div className="bg-[#F9FAF9] p-5 border-t border-gray-100 animate-in slide-in-from-top-2">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase mb-3">Rincian Item</h5>
                                    <div className="space-y-2">
                                        {trx.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[#4A5347]">{item.quantity}x</span>
                                                    <span className="text-gray-600">{item.produk?.nama || 'Produk Terhapus'}</span>
                                                </div>
                                                <span className="text-gray-500">Rp {Number(item.subtotal || 0).toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {trx.bukti_qris && (
                                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                                            <p className="text-xs font-bold text-gray-400 mb-2">Bukti Pembayaran</p>
                                            <a href={trx.bukti_qris} target="_blank" className="text-xs text-blue-500 underline">Lihat Bukti Foto</a>
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