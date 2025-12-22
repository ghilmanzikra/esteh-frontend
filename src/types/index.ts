// --- Tipe Data Umum ---

// Respon Login (Sesuai Console Log Backend)
export interface LoginResponse {
  message: string;
  token?: string;        // <--- TAMBAHAN: Backend kadang kirim ini
  access_token?: string; // <--- Yang kita duga sebelumnya
  token_type: string;
  user: User;
}

// --- UPDATE: Tipe Data User ---
export interface User {
  id: number;
  username: string;
  role: 'owner' | 'gudang' | 'karyawan' | 'supervisor';
  outlet_id?: number;
  
  // TAMBAHAN: Data relasi outlet dari backend
  outlet?: Outlet; 

  created_at?: string;
  updated_at?: string;
}

// Wrapper untuk Response List User
export interface UserResponse {
  message?: string;
  data: User[];
}

// --- UPDATE: Produk (Ada tambahan field komposisi jika diperlukan) ---
export interface Produk {
  id: number;
  nama: string;
  harga: number;
  kategori?: string; // Backend mungkin belum kirim kategori, jadi opsional
  gambar?: string;   // URL gambar dari backend
  status?: 'Tersedia' | 'Habis'; // Opsional jika backend belum support
  komposisi?: any[]; // Detail bahan
}

// Tipe Data Bahan Baku (Untuk Gudang & Stok)
export interface BahanBaku {
  id: number;
  nama: string;
  satuan: string;
  stok_gudang?: number; // Stok di gudang pusat
}

// UPDATE: Struktur Bahan agar sesuai object
export interface Bahan {
    id: number;
    nama: string;
    satuan: string;
    stok_minimum_gudang: number;
    stok_minimum_outlet: number;
}

// UPDATE: StokOutletItem menyesuaikan respon API
export interface StokOutletItem {
  id: number;
  outlet_id: number;
  bahan_id: number;
  stok: number;
  status?: 'Aman' | 'Menipis' | 'Kritis'; // Logic frontend
  bahan: BahanBaku; // Relasi ke bahan baku
}

// --- UPDATE: Tipe Data Outlet (Sesuai API Docs) ---
export interface Outlet {
  id: number;
  nama: string;
  alamat: string;
  is_active: boolean; // Backend pakai boolean (true/false)
  // Note: API /outlets tidak mengembalikan 'telepon' atau 'omset', jadi kita handle nanti
}

// Wrapper untuk Response List Outlet (Jaga-jaga kalau dibungkus 'data')
export interface OutletResponse {
  message: string;
  data: Outlet[];
}

// --- Error Handling ---
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// --- UPDATE: Tipe Data Dashboard Real dari Backend ---
export interface DashboardResponse {
  message: string;
  last_updated: string;
  data: {
    jumlah_stok_kritis: number;
    pendapatan_hari_ini: number;
    permintaan_pending: number;
    stok_gudang: any[]; // Sementara any dulu karena isinya array object
    total_gudang: number;
    total_karyawan: number;
    total_outlet: number;
    transaksi_hari_ini: number;
  }
}

// --- UPDATE: Tipe Data Laporan (Sesuai Real Response) ---
export interface LaporanItem {
  tanggal: string;
  total_transaksi?: number;
  pendapatan?: number;
  // Tambahkan field lain jika nanti backend sudah kirim data lengkap
}

// Wrapper Response Laporan
export interface LaporanResponse {
  message: string;
  periode: string;
  total_pendapatan: number;
  detail_per_hari: LaporanItem[]; // <--- Kuncinya di sini
}

// Tipe Data Transaksi (Payload & Response)
export interface TransaksiItem {
  id?: number;
  produk_id: number;
  quantity: number;
  harga_satuan: number;
  subtotal: number;
  produk?: Produk; // Untuk display riwayat
}

export interface Transaksi {
  id: number;
  user_id: number;
  outlet_id: number;
  total_harga: number;
  bayar: number;
  kembali: number;
  metode_bayar: 'tunai' | 'qris';
  status: 'pending' | 'selesai' | 'batal';
  tanggal: string; // ISO String
  items: TransaksiItem[];
}

// Payload untuk Create Transaksi
export interface CreateTransaksiPayload {
  outlet_id: number;
  total_harga: number;
  bayar: number;
  metode_bayar: 'tunai' | 'qris';
  items: {
    produk_id: number;
    quantity: number;
    harga_satuan: number; // Snapshot harga saat transaksi
  }[];
}

// Tipe Data Laporan
export interface LaporanSummary {
  pendapatan_harian: number;
  pendapatan_bulanan: number;
  total_transaksi: number;
  produk_terlaris: { nama: string; total: number }[];
}