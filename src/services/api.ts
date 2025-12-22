import { LoginResponse, User, Produk, Outlet, DashboardResponse, OutletResponse, UserResponse, LaporanResponse, StokOutletItem } from '../types';

// ============================================================================
// 🌐 KONFIGURASI URL (PENTING!)
// ============================================================================
// Cara kerja:
// 1. Cek apakah ada setting di file .env (Vite Environment)
// 2. Jika tidak ada, gunakan Localhost sebagai default (agar aman saat dev)
// 3. Opsi Production disediakan sebagai fallback terakhir

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// 💡 TIPS DEBUGGING:
// Cek di Console browser, url mana yang dipakai
console.log("🔗 API Base URL:", BASE_URL);

// ============================================================================
// 🛠️ SMART FETCHER (Engine Utama)
// ============================================================================

const fetcher = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('token');
  
  // 1. Siapkan Headers default
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // 2. Auto-inject Token jika ada
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 3. Handle Content-Type Otomatis
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
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // 4. Handle Response Text vs JSON
    const text = await response.text();
    let data;
    
    try {
        if (text) {
            data = JSON.parse(text);
        } else {
            data = {}; 
        }
    } catch (e) {
        // Jika server error HTML (bukan JSON), lempar error agar ketahuan
        throw new Error(`Server Error (${response.status}): Respon bukan JSON valid.`);
    }

    if (!response.ok) {
       // Tangkap pesan error spesifik dari backend jika ada
       throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    return data as T;

  } catch (error: any) {
    // 🚨 LOG ERROR YANG LEBIH JELAS
    console.error(`❌ [API Error] ${endpoint}:`, error.message);
    
    // Jika errornya Network Error (Server mati/salah alamat)
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error("Gagal menghubungi server. Pastikan backend (Laravel) sudah jalan di port 8000 atau URL Railway benar.");
    }
    
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
    fetcher<OutletResponse[]>('/outlets', { method: 'GET' }),
    
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
    fetcher<UserResponse>('/users', { method: 'GET' }),

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

  // Request Stok ke Gudang (Sesuai Mobile)
  requestStok: (data: { bahan_id: number; jumlah: number }) => 
    fetcher<any>('/permintaan-stok', { 
      method: 'POST', 
      body: JSON.stringify(data),
    }),

  // --- KARYAWAN: TRANSAKSI (KASIR) ---
  // Membuat transaksi baru (Checkout)
  createTransaksi: (payload: any) => 
    fetcher<any>('/transaksi', { 
       method: 'POST', 
       body: JSON.stringify(payload)
    }),

  // Endpoint Mobile: GET /transaksi (Filter outlet otomatis by token)
  getTransaksi: async () => {
      const res = await fetcher<any>('/transaksi', { method: 'GET' });
      return Array.isArray(res) ? res : (res.data || []);
  },


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

  approvePermintaan: (id: number) => 
    fetcher<any>(`/gudang/permintaan-stok/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify({ 
        status: 'approved' 
      }) 
    }),
};