import React, { useState, useEffect } from 'react';
import logoEsTeh from '../assets/logo.png';
import { Eye, EyeOff } from 'lucide-react'; // Kita tidak butuh CheckCircle lagi, kita bikin manual
import { api } from '../services/api'; 

interface LoginPageProps {
  onLogin: (role: 'karyawan' | 'gudang' | 'owner') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State untuk Popup
  const [showSuccess, setShowSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false); // State buat animasi keluar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username || !password) {
        throw new Error('Username dan password wajib diisi!');
      }

      console.log("Mencoba login dengan:", username);
      
      const response = await api.login({ 
        username: username, 
        password: password 
      });

      console.log("Login Sukses!", response);

      const token = response.token || response.access_token;

      if (token) {
        localStorage.setItem('token', token);
        console.log("Token Tersimpan di LocalStorage:", token); // Log buat mastiin
      } else {
        console.error("Gawat! Token tidak ditemukan di response backend!", response);
        throw new Error("Gagal menyimpan sesi login (Token hilang).");
      }

      let userRole = 'karyawan'; 
      if (response.user && response.user.role) {
        userRole = response.user.role.toLowerCase();
      } else {
         if (username.includes('owner')) userRole = 'owner';
         else if (username.includes('gudang')) userRole = 'gudang';
      }
      
      if (userRole === 'supervisor') userRole = 'owner';

      // --- MULAI ANIMASI SUKSES ---
      setIsLoading(false);
      setShowSuccess(true);

      // Timer untuk redirect (2 detik sesuai putaran animasi)
      setTimeout(() => {
        setRedirecting(true); // Trigger animasi keluar (fade out)
        setTimeout(() => {
          onLogin(userRole as 'karyawan' | 'gudang' | 'owner');
        }, 300); // Tunggu animasi keluar selesai sedikit
      }, 2000);

    } catch (err: any) {
      console.error("Login Error:", err); // Lihat di console, expand object errornya
      // Tambahkan alert detail biar tau pesan dari backend
      alert(`Gagal Login: ${err.message}`); 
      setError(err.message || 'Login gagal. Periksa koneksi atau password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F1F3E0] font-sans p-4 relative overflow-hidden">
      
      {/* --- CSS UNTUK ANIMASI SVG (Disisipkan Langsung) --- */}
      <style>{`
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
        @keyframes fill {
          100% { box-shadow: inset 0px 0px 0px 30px #B8E6B8; }
        }
        
        /* Animasi Lingkaran Waktu */
        .circle-timer {
            fill: none;
            stroke: #A1BC98;
            stroke-width: 3;
            stroke-dasharray: 163; /* Keliling lingkaran r=26 */
            stroke-dashoffset: 163;
            animation: stroke 2s linear forwards; /* 2 Detik durasi */
            transform-origin: center;
            transform: rotate(-90deg); /* Mulai dari jam 12 */
        }

        /* Animasi Centang */
        .checkmark-path {
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards; /* Delay 0.5s biar lingkaran jalan dulu */
        }
        
        .modal-enter {
            animation: modalIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes modalIn {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
        }
        
        .modal-exit {
            animation: modalOut 0.3s ease-in forwards;
        }

        @keyframes modalOut {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.9); }
        }
      `}</style>

      {/* --- POPUP LOGIN BERHASIL (PREMIUM ANIMATION) --- */}
      {showSuccess && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${redirecting ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`bg-white rounded-3xl p-10 shadow-2xl flex flex-col items-center max-w-sm w-full ${redirecting ? 'modal-exit' : 'modal-enter'}`}>
            
            {/* Animated Icon Container */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                {/* Background Circle (Abu tipis) */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 60 60">
                   <circle cx="30" cy="30" r="26" fill="none" stroke="#E3E9D5" strokeWidth="3" />
                </svg>
                
                {/* Progress Circle (Hijau - Timer) */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 60 60">
                   <circle cx="30" cy="30" r="26" className="circle-timer" />
                </svg>

                {/* Checkmark Icon */}
                <svg className="w-12 h-12 text-[#A1BC98]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <path className="checkmark-path" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
            </div>

            <h2 className="text-2xl font-bold text-[#4A5347] mb-2">Login Berhasil!</h2>
            <p className="text-[#778873] text-center text-sm">
                Senang melihatmu kembali,<br/>
                <span className="font-bold text-[#A1BC98]">{username}</span>
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-[#A1BC98] font-medium bg-[#F1F3E0] px-4 py-2 rounded-full animate-pulse">
                Sedang menyiapkan dashboard...
            </div>
          </div>
        </div>
      )}

      {/* Hiasan Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#A1BC98]/20 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#FF7675]/10 rounded-full blur-3xl z-0"></div>

      {/* Card Login */}
      <div className="bg-white w-full max-w-[400px] rounded-3xl shadow-[0_20px_60px_-15px_rgba(161,188,152,0.3)] p-10 flex flex-col items-center text-center relative z-10 border border-white/50">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FF7675] via-[#00B894] to-[#FDCB6E]"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-[#F1F3E0] p-2 mb-4 shadow-sm flex items-center justify-center">
            <img src={logoEsTeh} alt="Logo Es Teh Favorit" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-[#4A5347] mt-2">Selamat Datang Di</h1>
          <p className="text-[#A1BC98] font-medium mt-1">Es Teh Favorit Indonesia</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-500 text-xs font-medium py-3 px-4 rounded-xl border border-red-100 animate-shake flex items-center gap-2 text-left">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {error}
            </div>
          )}

          <div className="text-left">
            <label className="block text-[#4A5347] text-sm font-bold mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 h-[50px] rounded-xl border border-[#D2DCB6] text-[#4A5347] focus:outline-none focus:border-[#A1BC98] focus:ring-4 focus:ring-[#A1BC98]/10 transition-all placeholder:text-[#A1BC98]/60"
              placeholder="Silahkan Masukkan Username"
            />
          </div>

          {/* Password Field dengan Mata Sakti */}
          <div className="text-left relative">
            <label className="block text-[#4A5347] text-sm font-bold mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 h-[50px] rounded-xl border border-[#D2DCB6] text-[#4A5347] focus:outline-none focus:border-[#A1BC98] focus:ring-4 focus:ring-[#A1BC98]/10 transition-all placeholder:text-[#A1BC98]/60 font-sans pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1BC98] hover:text-[#4A5347] transition-colors focus:outline-none"
                title={showPassword ? "Sembunyikan Password" : "Lihat Password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || showSuccess}
            className="w-full bg-[#A1BC98] text-white font-bold h-[50px] rounded-xl hover:bg-[#8FAC86] active:scale-[0.98] transition-all shadow-lg shadow-[#A1BC98]/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center text-[15px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sedang Memproses...
              </span>
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        <div className="mt-12 text-[11px] text-[#778873] opacity-70 font-medium">
          © 2025 Es Teh Favorit Indonesia.
        </div>

      </div>
    </div>
  );
};

export default LoginPage;