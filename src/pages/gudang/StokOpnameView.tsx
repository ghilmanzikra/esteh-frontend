import React from 'react';
import { PackageSearch, Edit2, Search, Filter } from 'lucide-react';

const StokOpnameView = () => {
  const inventory = [
    { id: 1, name: 'Bubuk Teh Premium', cat: 'Bahan Baku', stock: 150, unit: 'Kg', status: 'Aman' },
    { id: 2, name: 'Gula Cair', cat: 'Pemanis', stock: 45, unit: 'Liter', status: 'Menipis' },
    { id: 3, name: 'Boba Tapioka', cat: 'Topping', stock: 5, unit: 'Kg', status: 'Kritis' },
    { id: 4, name: 'Cup 22oz', cat: 'Packaging', stock: 5000, unit: 'Pcs', status: 'Aman' },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E3E9D5] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1BC98]" size={20} />
          <input 
            type="text" placeholder="Cari SKU atau nama barang..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D2DCB6] focus:outline-none focus:border-[#A1BC98] text-[#4A5347]"
          />
        </div>
        <button className="px-4 py-2.5 border border-[#D2DCB6] text-[#778873] rounded-xl hover:bg-[#F1F3E0] font-medium flex items-center gap-2">
          <Filter size={18} /> Filter Kategori
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-3xl border border-[#E3E9D5] shadow-sm hover:border-[#A1BC98] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#F1F3E0] text-[#A1BC98] rounded-2xl">
                <PackageSearch size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                item.status === 'Aman' ? 'bg-[#B8E6B8]/30 text-[#2d5a2d]' :
                item.status === 'Menipis' ? 'bg-[#FFE9B8]/50 text-[#6b5310]' :
                'bg-[#F5B8B8]/30 text-[#752323]'
              }`}>
                {item.status}
              </span>
            </div>
            
            <h4 className="font-bold text-[#4A5347] text-lg mb-1">{item.name}</h4>
            <p className="text-xs text-[#778873] bg-[#F8FAF7] px-2 py-1 rounded-lg inline-block mb-4">{item.cat}</p>
            
            <div className="flex justify-between items-end border-t border-[#F1F3E0] pt-4">
              <div>
                <p className="text-xs text-[#778873] mb-1">Stok Fisik</p>
                <p className="text-2xl font-bold text-[#4A5347]">{item.stock} <span className="text-sm font-medium text-[#778873]">{item.unit}</span></p>
              </div>
              <button className="p-2 rounded-xl bg-[#F1F3E0] text-[#778873] hover:bg-[#A1BC98] hover:text-white transition-colors">
                <Edit2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StokOpnameView;