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
  
  // Handle jika response bukan JSON (kadang error server balikin HTML)
  const text = await response.text();
  let data;
  try {
      data = JSON.parse(text);
  } catch (e) {
      // Jika gagal parse JSON, lempar error dengan text aslinya
      throw new Error(`Server Error (${response.status}): ${text.substring(0, 50)}...`);
  }

  if (!response.ok) {
    throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
  }

  return data as T;
};

// ============================================================================
// 📦 KUMPULAN ENDPOINT (SERVICE LAYER)
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

  getLaporanPendapatan: (startDate: string, endDate: string) => 
    fetcher<LaporanResponse>(`/laporan/pendapatan?start_date=${startDate}&end_date=${endDate}`, { method: 'GET' }),

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

  // --- KARYAWAN FEATURES ---
  getProduk: () => fetcher<Produk[]>('/produk', { 
    method: 'GET' 
  }),
  
  createProduk: (formData: FormData) => fetcher<any>('/produk', { 
    method: 'POST', 
    body: formData 
  }),
  
  updateProduk: (id: number, formData: FormData) => fetcher<any>(`/produk/${id}`, { 
    method: 'POST', // Backend PHP kadang butuh POST dengan _method: PUT di FormData
    body: formData 
  }),

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
  // 1. Stok Gudang & Bahan
  getStokGudang: () => 
    fetcher<any>('/gudang/stok', { 
      method: 'GET' 
    }),

  getBahan: () => 
    fetcher<any>('/gudang/bahan', { 
      method: 'GET' 
    }),

  // 2. Barang Masuk (Restock Gudang)
  getBarangMasuk: () => 
    fetcher<any>('/gudang/barang-masuk', { 
      method: 'GET' 
    }),

  createBarangMasuk: (body: any) => 
    fetcher<any>('/gudang/barang-masuk', { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),

  // 3. Barang Keluar (Kirim ke Outlet)
  // FIX: Kita biarkan endpoint ini, tapi nanti kita handle errornya di view jika backend belum siap
  getBarangKeluar: () => 
    fetcher<any>('/gudang/barang-keluar', { 
      method: 'GET' 
    }),

  // 4. Permintaan Stok dari Outlet (Inbox Gudang)
  // FIX: Menggunakan endpoint umum /permintaan-stok karena endpoint /gudang/permintaan-stok error 405
  getPermintaanStok: () => 
    fetcher<any>('/permintaan-stok', { 
      method: 'GET' 
    }),

  approvePermintaan: (id: number) => 
    fetcher<any>(`/gudang/permintaan-stok/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify({ status: 'approved' }) 
    }),
};