import React, { useState } from 'react';
import { Plus, Calendar, User, Package, Save } from 'lucide-react';

interface IncomingItem {
  id: number;
  date: string;
  supplier: string;
  item: string;
  qty: number;
  status: 'Selesai' | 'Proses';
}

const BarangMasukView = () => {
  const [items, setItems] = useState<IncomingItem[]>([
    { id: 1, date: '2025-11-26', supplier: 'PT. Gula Manis', item: 'Gula Cair', qty: 50, status: 'Selesai' },
    { id: 2, date: '2025-11-26', supplier: 'Teh Indonesia', item: 'Bubuk Teh', qty: 100, status: 'Selesai' },
  ]);

  // Form State
  const [newItem, setNewItem] = useState({ supplier: '', item: '', qty: '' });

  const handleAdd = () => {
    if (!newItem.supplier || !newItem.item || !newItem.qty) return;
    const newEntry: IncomingItem = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      supplier: newItem.supplier,
      item: newItem.item,
      qty: parseInt(newItem.qty),
      status: 'Selesai'
    };
    setItems([newEntry, ...items]);
    setNewItem({ supplier: '', item: '', qty: '' }); // Reset form
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Form Input Cepat */}
      <div className="bg-white p-6 rounded-3xl border border-[#E3E9D5] shadow-sm">
        <h3 className="font-bold text-[#4A5347] mb-4 flex items-center gap-2">
          <Plus size={18} className="text-[#A1BC98]" /> Catat Penerimaan Baru
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#778873] ml-1">Supplier</label>
            <input 
              value={newItem.supplier}
              onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
              type="text" placeholder="Nama Supplier" 
              className="w-full px-4 py-2.5 rounded-xl border border-[#D2DCB6] focus:outline-none focus:border-[#A1BC98] text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#778873] ml-1">Nama Barang</label>
            <input 
              value={newItem.item}
              onChange={(e) => setNewItem({...newItem, item: e.target.value})}
              type="text" placeholder="Contoh: Bubuk Teh" 
              className="w-full px-4 py-2.5 rounded-xl border border-[#D2DCB6] focus:outline-none focus:border-[#A1BC98] text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#778873] ml-1">Jumlah</label>
            <input 
              value={newItem.qty}
              onChange={(e) => setNewItem({...newItem, qty: e.target.value})}
              type="number" placeholder="0" 
              className="w-full px-4 py-2.5 rounded-xl border border-[#D2DCB6] focus:outline-none focus:border-[#A1BC98] text-sm"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleAdd}
              className="w-full py-2.5 bg-[#A1BC98] text-white rounded-xl font-bold text-sm hover:bg-[#8FAC86] transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Simpan Data
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="flex-1 bg-white rounded-3xl border border-[#E3E9D5] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAF7] text-[#778873] text-sm font-semibold">
              <tr>
                <th className="p-5 pl-6">Tanggal</th>
                <th className="p-5">Supplier</th>
                <th className="p-5">Barang</th>
                <th className="p-5">Jumlah Masuk</th>
                <th className="p-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3E0] text-[#4A5347]">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-[#FAFCF9] transition-colors">
                  <td className="p-5 pl-6 text-sm flex items-center gap-2">
                    <Calendar size={14} className="text-[#A1BC98]" /> {item.date}
                  </td>
                  <td className="p-5 font-medium">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[#D2DCB6]" /> {item.supplier}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-[#D2DCB6]" /> {item.item}
                    </div>
                  </td>
                  <td className="p-5 font-bold text-[#A1BC98]">+{item.qty}</td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-[#B8E6B8]/30 text-[#2d5a2d] rounded-full text-xs font-bold">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BarangMasukView;