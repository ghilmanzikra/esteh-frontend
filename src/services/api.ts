import { LoginResponse, User, Produk, Outlet, DashboardResponse, OutletResponse, UserResponse, LaporanResponse, StokOutletItem } from '../types';

// 1. Konfigurasi Dasar
// BASE_URL sekarang bisa dikonfigurasi lewat env var VITE_API_BASE_URL.
// Jika tidak diset, gunakan URL produksi default.
const DEFAULT_BASE_URL = 'https://esteh-backend-production.up.railway.app/api';
const rawBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
const BASE_URL = rawBase ? rawBase.replace(/\/$/, '') : DEFAULT_BASE_URL;
// API_ORIGIN: base origin without the `/api` suffix, useful for building absolute image URLs
export const API_ORIGIN = BASE_URL.replace(/\/api(\/)?$/i, '');
// contoh .env: VITE_API_BASE_URL=http://localhost:5173/api

// ============================================================================
// 🛠️ SMART FETCHER (Engine Utama) - DIPERTAHANKAN & DIPERBAIKI
// ============================================================================

const fetcher = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('token');
  
  // 1. Siapkan Headers default
  const headers: Record<string, string> = {
    'Accept': 'application/json', // Selalu terima JSON
    ...(options.headers as Record<string, string>),
  };

  // 2. Auto-inject Token jika ada
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 3. Handle Content-Type Otomatis
  // Jika body adalah FormData, browser otomatis set boundary, jadi JANGAN set manual.
  // Jika bukan FormData, set application/json.
  if (!(options.body instanceof FormData)) {
     if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
     }
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    // console.log(`[API REQUEST] ${endpoint}`, config); // Debugging Log

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // 4. Handle Response Text vs JSON
    const text = await response.text();
    let data: any = null;
    // Try parse JSON, otherwise keep raw text
    try {
      if (text) {
        data = JSON.parse(text);
      } else {
        data = {};
      }
    } catch (e) {
      data = text; // keep raw text for debugging
    }

    if (!response.ok) {
       // Build informative error message
       const serverMessage = (typeof data === 'object' && data && data.message) ? data.message : (typeof data === 'string' ? data : null);
       const errMsg = serverMessage || `Error ${response.status}: ${response.statusText}`;
       console.error(`[API Response Error] ${endpoint} status=${response.status} body=`, data);
       throw new Error(errMsg);
    }

    return data as T;

  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
};

// ============================================================================
// 📦 SERVICE LAYER (Kumpulan Endpoint)
// ============================================================================

export const api = {
  // --- AUTHENTICATION ---
  login: (body: any) => 
    fetcher<LoginResponse>('/login', { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
  
  getMe: () => 
    fetcher<User>('/me', { 
      method: 'GET' 
    }),

  logout: () => 
    fetcher<{message: string}>('/logout', { 
      method: 'POST' 
    }),

  // --- OWNER FEATURES ---
  getDashboard: () => 
    fetcher<DashboardResponse>('/dashboard', { method: 'GET' }),
    
  getOutlets: () => 
    fetcher<OutletResponse | Outlet[]>('/outlets', { method: 'GET' }),
    
  getOutletDetail: (id: number) =>
    fetcher<Outlet>(`/outlets/${id}`, { method: 'GET' }),

  createOutlet: (body: any) => 
    fetcher<Outlet>('/outlets', { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),

  updateOutlet: (id: number, body: any) => 
    fetcher<Outlet>(`/outlets/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),

  deleteOutlet: (id: number) => 
    fetcher<any>(`/outlets/${id}`, { method: 'DELETE' }),

  getUsers: () => 
    fetcher<UserResponse | User[]>('/users', { method: 'GET' }),

  createUser: (body: any) => 
    fetcher<User>('/users', { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),

  updateUser: (id: number, body: any) => 
    fetcher<User>(`/users/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),

  deleteUser: (id: number) => 
    fetcher<any>(`/users/${id}`, { method: 'DELETE' }),  

  getLaporanPendapatan: (startDate: string, endDate: string) => 
    fetcher<LaporanResponse>(`/laporan/pendapatan?start_date=${startDate}&end_date=${endDate}`, { method: 'GET' }),

  // Khusus download, kita bypass fetcher karena butuh Blob
  downloadLaporan: async (startDate: string, endDate: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/laporan/export?start_date=${startDate}&end_date=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) throw new Error("Gagal download laporan");
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_EsTeh_${startDate}_${endDate}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // --- KARYAWAN: PRODUK (MANAJEMEN MENU) ---
  // Sesuai logika Mobile: return array produk
  getProduk: () => 
    fetcher<Produk[]>('/produk', { method: 'GET' }),

  // Create Produk: Menerima FormData (untuk gambar + data)
  createProduk: (formData: FormData) => 
    fetcher<any>('/produk', { 
      method: 'POST', 
      body: formData // Fetcher akan otomatis tahu ini FormData -> Content-Type dihapus
    }),

  deleteProduk: (id: number) => 
    fetcher<any>(`/produk/${id}`, { method: 'DELETE' }),

  // --- KARYAWAN: STOK BAHAN BAKU ---
  // Mengambil stok outlet (untuk dropdown bahan baku & monitoring stok)
  getStokOutlet: async () => {
    const res = await fetcher<any>('/stok/outlet', { method: 'GET' });
    return Array.isArray(res) ? res : (res.data || []);
  },

  // Untuk Karyawan: akses bahan yang relevan untuk outlet (menggunakan stok/outlet)
  // Menghindari pemanggilan /gudang/bahan yang role-restricted
  getBahanOutlet: async () => {
    const res = await fetcher<any>('/stok/outlet', { method: 'GET' });
    return Array.isArray(res) ? res : (res.data || []);
  },

  // Untuk Karyawan: ambil seluruh list bahan yang tersedia di gudang
  // Sesuai dokumentasi baru, karyawan dapat mengakses endpoint public `/bahan-gudang`
  getBahanGudang: async () => {
    const res = await fetcher<any>('/bahan-gudang', { method: 'GET' });
    return Array.isArray(res) ? res : (res.data || []);
  },

  // Request Stok ke Gudang (Sesuai Mobile)
  requestStok: (data: { bahan_id: number; jumlah: number }) => 
    fetcher<any>('/permintaan-stok', { 
      method: 'POST', 
      body: JSON.stringify(data),
    }),

  // --- KARYAWAN: TRANSAKSI (KASIR) ---
  // Membuat transaksi baru (Checkout)
  createTransaksi: (payload: any | FormData) => {
    // Jika FormData (untuk bukti_qris/file), kirim langsung tanpa JSON.stringify
    if (payload instanceof FormData) {
      return fetcher<any>('/transaksi', { method: 'POST', body: payload });
    }
    return fetcher<any>('/transaksi', { method: 'POST', body: JSON.stringify(payload) });
  },

  // Endpoint Mobile: GET /transaksi (Filter outlet otomatis by token)
  getTransaksi: async () => {
      const res = await fetcher<any>('/transaksi', { method: 'GET' });
      return Array.isArray(res) ? res : (res.data || []);
  },

  // Hapus / Batalkan transaksi (mengembalikan stok oleh backend)
  deleteTransaksi: (id: number) =>
    fetcher<any>(`/transaksi/${id}`, { method: 'DELETE' }),


  // --- GUDANG FEATURES (Placeholder / Persiapan) ---
  getStokGudang: () => 
    fetcher<any>('/gudang/stok', { 
      method: 'GET' 
    }),

  getBahan: () => 
    fetcher<any>('/gudang/bahan', { 
      method: 'GET' 
    }),

  getBarangMasuk: () => 
    fetcher<any>('/gudang/barang-masuk', { 
      method: 'GET' 
    }),

  createBarangMasuk: (body: any) => 
    fetcher<any>('/gudang/barang-masuk', { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
  
  // Update / Delete Barang Masuk (Gudang)
  updateBarangMasuk: (id: number, body: any) =>
    fetcher<any>(`/gudang/barang-masuk/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  deleteBarangMasuk: (id: number) =>
    fetcher<any>(`/gudang/barang-masuk/${id}`, { method: 'DELETE' }),

  getBarangKeluar: () => 
    fetcher<any>('/gudang/barang-keluar', { 
      method: 'GET' 
    }),

  createBarangKeluar: (body: any) => 
    fetcher<any>('/gudang/barang-keluar', { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),

  getPermintaanStok: () => 
    fetcher<any>('/permintaan-stok', { 
      method: 'GET' 
    }), // Endpoint list permintaan untuk gudang

  // Permintaan Stok khusus untuk GUDANG (role gudang) => gunakan namespace /gudang
  getPermintaanStokGudang: () =>
    fetcher<any>('/gudang/permintaan-stok', { method: 'GET' }),

  approvePermintaan: (id: number) => 
    fetcher<any>(`/gudang/permintaan-stok/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify({ 
        status: 'approved' 
      }) 
    }),
  
  rejectPermintaan: (id: number) =>
    fetcher<any>(`/gudang/permintaan-stok/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'rejected' })
    }),

  // Generic helper to update permintaan status. If `forGudang` is true,
  // it will call the `/gudang/permintaan-stok/{id}` namespace, otherwise
  // it will call the public `/permintaan-stok/{id}` endpoint.
  updatePermintaanStatus: (id: number, status: string, extra?: any, forGudang = false) => {
    const endpoint = forGudang ? `/gudang/permintaan-stok/${id}` : `/permintaan-stok/${id}`;
    const payload = { status, ...(extra || {}) };
    return fetcher<any>(endpoint, { method: 'PUT', body: JSON.stringify(payload) });
  },
  
  // Karyawan/Gudang: Konfirmasi penerimaan barang (opsional bukti_foto)
  terimaBarangKeluar: (id: number, payload?: FormData) => {
    if (payload instanceof FormData) {
      return fetcher<any>(`/gudang/barang-keluar/${id}/terima`, { method: 'POST', body: payload });
    }
    return fetcher<any>(`/gudang/barang-keluar/${id}/terima`, { method: 'POST', body: JSON.stringify(payload) });
  },
  
  // Permintaan Stok: update / delete (karyawan)
  updatePermintaan: (id: number, body: any) =>
    fetcher<any>(`/permintaan-stok/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  deletePermintaan: (id: number) =>
    fetcher<any>(`/permintaan-stok/${id}`, { method: 'DELETE' }),

  // Kategori: untuk karyawan gunakan `/kategori` (lihat dokumentasi baru)
  // Backend juga menyediakan `/gudang/kategori` untuk akun gudang.
  getKategori: () =>
    fetcher<any>('/kategori', { method: 'GET' }),

  // Produk update (PUT /produk/{id}) - menerima FormData for images
  updateProduk: (id: number, formData: FormData) =>
    fetcher<any>(`/produk/${id}`, { method: 'PUT', body: formData }),
};