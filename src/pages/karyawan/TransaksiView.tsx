import React, { useEffect, useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, Banknote, QrCode, Loader2, Search, Coffee, CreditCard, Save } from 'lucide-react';
import { api } from '../../services/api';


// Interface Transaksi
interface Produk {
  id: number;
  nama: string;
  harga: number;
  image_url?: string;
}

interface CartItem extends Produk {
  qty: number;
}

const TransaksiView = () => {
  const [products, setProducts] = useState<Produk[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [metodeBayar, setMetodeBayar] = useState<'TUNAI' | 'QRIS'>('TUNAI');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // State loading checkout

  // Fetch Produk dari API
  const fetchProduk = async () => {
    try {
      setLoading(true);
      const res = await api.getProduk() as any;
      const data = Array.isArray(res) ? res : res.data || [];
      setProducts(data);
    } catch (err) {
      console.error("Gagal ambil produk", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  // --- CART LOGIC ---
  const addToCart = (produk: Produk) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === produk.id);
      if (existing) {
        return prev.map((item) =>
          item.id === produk.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...produk, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      });
    });
  };

  const totalHarga = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);

  // --- CHECKOUT LOGIC (Updated for Mobile Compatibility) ---
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    
    if (!confirm(`Proses pembayaran senilai Rp ${totalHarga.toLocaleString('id-ID')}?`)) return;

    setIsProcessing(true);

    try {
      // Struktur Payload Sesuai Mobile
      const payload = {
        items: cart.map(item => ({
          produk_id: item.id,
          quantity: item.qty,
          subtotal: item.harga * item.qty
        })),
        total_harga: totalHarga,
        metode_bayar: metodeBayar,
        uang_dibayar: totalHarga // Asumsi pas, nanti bisa ditambah input uang
      };

      console.log("Sending Checkout Payload:", payload);
      
      await api.createTransaksi(payload);
      
      alert("Transaksi Berhasil! ✅");
      setCart([]); // Kosongkan keranjang
      setMetodeBayar('TUNAI');
      
    } catch (error: any) {
      console.error("Checkout Gagal:", error);
      alert("Gagal memproses transaksi: " + (error.message || "Server Error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-6">
      
      {/* LEFT: Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari menu favorit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#A1BC98] focus:ring-2 focus:ring-[#A1BC98]/20 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Grid Container */}
        <div className="flex-1 overflow-y-auto pr-2 pb-20">
            {loading ? (
                <div className="flex justify-center py-20 text-[#A1BC98]">Memuat Menu...</div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {filteredProducts.map((produk) => (
                    <div
                        key={produk.id}
                        onClick={() => addToCart(produk)}
                        className="bg-white p-3 rounded-2xl border border-[#F1F3E0] cursor-pointer hover:border-[#A1BC98] hover:shadow-md transition-all group flex flex-col"
                    >
                        <div className="h-32 bg-[#F8FAF7] rounded-xl mb-3 overflow-hidden relative">
                            {produk.image_url ? (
                                <img src={produk.image_url} alt={produk.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Coffee size={32} />
                                </div>
                            )}
                            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus size={16} className="text-[#4A5347]"/>
                            </div>
                        </div>
                        <h3 className="font-bold text-[#4A5347] text-sm mb-1 truncate">{produk.nama}</h3>
                        <p className="text-[#A1BC98] font-bold text-sm">Rp {Number(produk.harga).toLocaleString('id-ID')}</p>
                    </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* RIGHT: Cart Sidebar */}
      <div className="w-full md:w-[380px] bg-white rounded-3xl shadow-xl shadow-[#A1BC98]/10 flex flex-col border border-[#E3E9D5] h-full overflow-hidden">
        {/* Cart Header */}
        <div className="p-6 border-b border-[#F1F3E0] bg-[#FDFDFD]">
          <h2 className="text-xl font-bold text-[#4A5347] flex items-center gap-2">
            <ShoppingCart size={24} className="text-[#A1BC98]" />
            Keranjang
            <span className="bg-[#A1BC98] text-white text-xs px-2 py-0.5 rounded-full ml-auto">
              {cart.length} Item
            </span>
          </h2>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFCFC]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2">
              <ShoppingCart size={48} className="opacity-20" />
              <p className="text-sm font-medium">Belum ada pesanan</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#F1F3E0] shadow-sm animate-in slide-in-from-right-4 duration-300">
                 {/* Mini Image */}
                 <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                         <img src={item.image_url} alt={item.nama} className="w-full h-full object-cover"/>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"><Coffee size={16} className="text-gray-300"/></div>
                    )}
                 </div>

                 {/* Info */}
                 <div className="flex-1">
                    <h4 className="font-bold text-[#4A5347] text-sm truncate">{item.nama}</h4>
                    <p className="text-[#A1BC98] text-xs font-semibold">Rp {Number(item.harga * item.qty).toLocaleString('id-ID')}</p>
                 </div>

                 {/* Controls */}
                 <div className="flex items-center gap-2 bg-[#F8FAF7] rounded-lg p-1">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded-md shadow-sm transition-colors text-gray-500 hover:text-red-500">
                        {item.qty === 1 ? <Trash2 size={14}/> : <Minus size={14}/>}
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded-md shadow-sm transition-colors text-gray-500 hover:text-[#4A5347]">
                        <Plus size={14}/>
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* Payment & Summary Section */}
        <div className="p-6 bg-white border-t border-[#E3E9D5] space-y-4 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-10">
           {/* Metode Pembayaran */}
           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setMetodeBayar('TUNAI')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border-2 ${metodeBayar === 'TUNAI' ? 'border-[#A1BC98] bg-[#F1F3E0] text-[#4A5347]' : 'border-transparent bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
              >
                 <Banknote size={18} /> Tunai
              </button>
              <button 
                onClick={() => setMetodeBayar('QRIS')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border-2 ${metodeBayar === 'QRIS' ? 'border-[#A1BC98] bg-[#F1F3E0] text-[#4A5347]' : 'border-transparent bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
              >
                 <CreditCard size={18} /> QRIS
              </button>
           </div>

           {/* Total & Button */}
           <div className="space-y-3">
              <div className="flex justify-between items-end">
                 <span className="text-gray-400 text-sm">Total Tagihan</span>
                 <span className="text-2xl font-black text-[#4A5347]">Rp {totalHarga.toLocaleString('id-ID')}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isProcessing || cart.length === 0}
                className="w-full py-4 bg-[#4A5347] text-white font-bold rounded-xl hover:bg-[#2C3E2D] active:scale-95 transition-all shadow-lg shadow-[#4A5347]/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                 {isProcessing ? 'Memproses...' : (
                    <>
                        <Save size={20} /> Proses Pembayaran
                    </>
                 )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TransaksiView;