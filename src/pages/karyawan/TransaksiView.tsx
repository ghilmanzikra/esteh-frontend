import React, { useEffect, useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, Banknote, QrCode, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { Produk } from '../../types';

interface CartItem extends Produk {
  qty: number;
}

const TransaksiView = () => {
  const [products, setProducts] = useState<Produk[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Produk untuk Katalog
  useEffect(() => {
    api.getProduk().then(res => {
        if(Array.isArray(res)) setProducts(res);
        // @ts-ignore
        else if(res.data) setProducts(res.data);
        setLoading(false);
    }).catch(err => {
        console.error(err);
        setLoading(false);
    });
  }, []);

  const addToCart = (prod: Produk) => {
    setCart(prev => {
      const exist = prev.find(p => p.id === prod.id);
      if (exist) return prev.map(p => p.id === prod.id ? {...p, qty: p.qty + 1} : p);
      return [...prev, { ...prod, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, qty: Math.max(0, item.qty + delta) };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!confirm("Proses pembayaran?")) return;

    try {
        // Format payload sesuai dokumentasi: items string JSON
        const itemsPayload = cart.map(c => ({ produk_id: c.id, quantity: c.qty }));
        
        await api.createTransaksi({
            tanggal: new Date().toISOString().slice(0, 19).replace('T', ' '),
            metode_bayar: 'tunai', // Default tunai dulu
            items: JSON.stringify(itemsPayload) // STRINGIFY SESUAI DOCS!
        });
        
        alert("Transaksi Berhasil!");
        setCart([]); // Kosongkan keranjang
    } catch (err: any) {
        alert("Transaksi Gagal: " + err.message);
    }
  };

  // Hitung total
  const total = cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);

  if (loading) return <div className="p-20 text-center">Loading Katalog...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
      {/* Katalog Kiri */}
      <div className="flex-1 overflow-y-auto pb-20">
         <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(prod => (
                <div key={prod.id} onClick={() => addToCart(prod)} className="bg-white p-4 rounded-2xl border border-[#E3E9D5] hover:border-[#A1BC98] cursor-pointer transition-all">
                    <div className="h-28 bg-[#F1F3E0] rounded-xl mb-3 overflow-hidden">
                        {prod.gambar && <img src={prod.gambar} className="w-full h-full object-cover" />}
                    </div>
                    <h3 className="font-bold text-[#4A5347]">{prod.nama}</h3>
                    <p className="text-[#A1BC98] font-bold">Rp {prod.harga.toLocaleString()}</p>
                </div>
            ))}
         </div>
      </div>

      {/* Keranjang Kanan */}
      <div className="w-full lg:w-[380px] bg-white rounded-3xl shadow-xl flex flex-col h-full">
         <div className="p-5 border-b border-[#F1F3E0] font-bold text-lg text-[#4A5347]">Keranjang</div>
         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                    <div>
                        <div className="font-bold text-sm text-[#4A5347]">{item.nama}</div>
                        <div className="text-xs text-[#A1BC98]">x{item.qty}</div>
                    </div>
                    <div className="font-bold text-sm">Rp {(item.harga * item.qty).toLocaleString()}</div>
                    {/* Add Remove Buttons here if needed */}
                </div>
            ))}
         </div>
         <div className="p-5 bg-[#F8FAF7] border-t border-[#E3E9D5]">
            <div className="flex justify-between font-bold text-xl text-[#4A5347] mb-4">
                <span>Total</span>
                <span>Rp {total.toLocaleString()}</span>
            </div>
            <button onClick={handleCheckout} className="w-full py-3 bg-[#A1BC98] text-white rounded-xl font-bold hover:bg-[#8FAC86]">
                Bayar Sekarang
            </button>
         </div>
      </div>
    </div>
  );
};

export default TransaksiView;