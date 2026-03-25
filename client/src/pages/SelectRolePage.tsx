import { useNavigate } from 'react-router-dom';

const SelectRolePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#111827] to-[#1f2937]">
      <div className="w-full max-w-4xl px-6">
        <div className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#3E5D99] text-2xl font-bold">
              DUE
            </div>
            <h1 className="text-5xl font-extrabold tracking-wide text-white">N4 DUE</h1>
          </div>
          <p className="text-lg text-white/70">
            Hệ thống quản lý và đặt lịch sân thể thao
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Student Role Card */}
          <button
            onClick={() => navigate('/student')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4CAF50] to-[#45a049] p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-4xl">
                👨‍🎓
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white">Sinh viên</h2>
              <p className="mb-6 text-white/90">
                Đặt sân, quản lý vé, xem lịch sử đặt sân và quản lý tài khoản
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  Đặt sân
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  Vé của tôi
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  Lịch sử đặt sân
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  Tài khoản
                </span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 transition-all duration-300 group-hover:scale-150" />
          </button>

          {/* Admin Role Card */}
          <button
            onClick={() => navigate('/admin')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E5D99] to-[#36558F] p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-4xl">
                👨‍💼
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white">Admin</h2>
              <p className="mb-6 text-white/90">
                Quản lý dashboard, duyệt đặt sân, cấu hình sân và quản lý sân
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  Dashboard
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  Duyệt đặt sân
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  Cấu hình sân
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  Quản lý sân
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  Tài khoản
                </span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 transition-all duration-300 group-hover:scale-150" />
          </button>

          {/* Employee Role Card */}
          <button
            onClick={() => navigate('/employee')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF9800] to-[#F57C00] p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative z-10">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-4xl">
                👨‍🔧
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white">Nhân viên</h2>
              <p className="mb-6 text-white/90">
                Check-in khách hàng, xác nhận thanh toán và quản lý tài khoản
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  Check-in
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  Xác nhận thanh toán
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">
                  Tài khoản
                </span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 transition-all duration-300 group-hover:scale-150" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRolePage;
