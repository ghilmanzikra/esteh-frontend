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

// --- NEW: Stok Outlet ---
export interface StokOutletItem {
  id: number;
  bahan: string;     // Nama bahan
  stok: number;
  satuan: string;
  status: 'Aman' | 'Kritis' | 'Menipis';
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