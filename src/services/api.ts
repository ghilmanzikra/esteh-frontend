import { LoginResponse, User, Produk, Outlet, DashboardResponse, OutletResponse, UserResponse, LaporanResponse, StokOutletItem } from '../types';

// 1. Konfigurasi Dasar
const BASE_URL = 'https://esteh-backend-production.up.railway.app/api';

// Helper Fetcher Canggih (Bisa JSON & FormData)
const fetcher = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('token');
  
  // Default Headers
  const headers: HeadersInit = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  // Auto-inject Token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // DETEKSI OTOMATIS:
  // Jika body adalah FormData, JANGAN set Content-Type (biar browser yang atur boundary)
  // Jika body bukan FormData, set Content-Type: application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
  }

  return data as T;
};

// ============================================================================
// 📦 KUMPULAN ENDPOINT (SERVICE LAYER)
// Semua endpoint dari temanmu kita daftarkan di sini.
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
    fetcher<DashboardResponse>('/dashboard', { 
      method: 'GET' 
    }),
    
  getOutlets: () => 
    fetcher<OutletResponse[]>('/outlets', { 
      method: 'GET' 
    }),
    
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
    fetcher<any>(`/outlets/${id}`, { 
      method: 'DELETE' 
    }),

  getUsers: () => 
    fetcher<UserResponse>('/users', { 
      method: 'GET' 
    }),

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
    fetcher<any>(`/users/${id}`, { 
      method: 'DELETE' 
    }),  

   // 1. Get Data Tabel (JSON)
  getLaporanPendapatan: (startDate: string, endDate: string) => 
    fetcher<LaporanResponse>(`/laporan/pendapatan?start_date=${startDate}&end_date=${endDate}`, { method: 'GET' }),

  // 2. Download Excel (BLOB)
  // Ini butuh perlakuan khusus karena response-nya bukan JSON, tapi File (Blob)
  downloadLaporan: async (startDate: string, endDate: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/laporan/export?start_date=${startDate}&end_date=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) throw new Error("Gagal download laporan");
    
    // Convert ke Blob (Binary Large Object) lalu buat link download palsu
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_EsTeh_${startDate}_${endDate}.xlsx`; // Nama file
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // --- KARYAWAN FEATURES ---
  getProduk: () => fetcher<Produk[]>('/produk', { 
    method: 'GET' 
  }),
  
  // Create Produk pakai FormData (untuk upload gambar)
  createProduk: (formData: FormData) => fetcher<any>('/produk', { 
    method: 'POST', 
    body: formData 
  }),
  updateProduk: (id: number, formData: FormData) => fetcher<any>(`/produk/${id}`, { 
    method: 'PUT', 
    body: formData 
  }), // Endpoint PUT biasanya untuk update

  deleteProduk: (id: number) => fetcher<any>(`/produk/${id}`, { 
    method: 'DELETE' 
  }),

  createTransaksi: (body: any) => fetcher<any>('/transaksi', { 
    method: 'POST', 
    body: JSON.stringify(body) 
  }),

  // --- KARYAWAN (STOK) ---
  getStokOutlet: () => fetcher<StokOutletItem[]>('/stok/outlet', { 
    method: 'GET' 
  }),

  requestStok: (body: any) => fetcher<any>('/permintaan-stok', { 
    method: 'POST', 
    body: JSON.stringify(body) 
  }),

  // --- GUDANG FEATURES ---
  getStokGudang: () => 
    fetcher<any>('/gudang/stok', { method: 'GET' }),

  createBarangMasuk: (body: any) => 
    fetcher<any>('/gudang/barang-masuk', { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
};