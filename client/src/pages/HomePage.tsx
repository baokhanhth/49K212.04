import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#111827] to-[#1f2937]">
      <div className="w-full max-w-4xl px-6">
        <div className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <img
              src="/logo.png"
              alt="DUE Logo"
              className="h-16 w-16 rounded-2xl object-contain"
            />
            <h1 className="text-5xl font-extrabold tracking-wide text-white">N4 DUE</h1>
          </div>
          <p className="text-lg text-white/70">
            Hệ thống quản lý và đặt lịch sân thể thao
          </p>
        </div>

        <div className="flex justify-center gap-6">
          <button
            onClick={() => navigate('/dang-ky')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4CAF50] to-[#45a049] px-12 py-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <span className="text-xl font-semibold">Đăng ký</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/dang-nhap')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3E5D99] to-[#36558F] px-12 py-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔐</span>
              <span className="text-xl font-semibold">Đăng nhập</span>
            </div>
          </button>
        </div>

        <div className="mt-16 text-center">
          <p className="text-white/50 text-sm">
            © 2024 N4 DUE - Hệ thống quản lý sân thể thao
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
