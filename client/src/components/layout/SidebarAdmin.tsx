import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import { authApi } from '../../services/api';

const SidebarAdmin: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openUser, setOpenUser] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.dangXuat();
    } catch {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/dang-nhap');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Duyệt đặt sân', path: '/admin/duyet-dat-san' },
    { label: 'Cấu hình sân', path: '/admin/cau-hinh-san-bai' },
    { label: 'Quản lý sân', path: '/admin/quan-ly-san' },
    { label: 'Tài khoản', path: '/admin/tai-khoan' },
  ];

  return (
    <aside className="flex w-[250px] flex-col bg-gradient-to-b from-[#3E5D99] to-[#36558F] px-6 py-7 text-white">

      {/* Logo */}
      <div className="mb-10">
        <Logo />
      </div>

      {/* Menu */}
      <nav className="space-y-3">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`relative block rounded-2xl px-4 py-3 text-lg font-medium transition ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              {active && (
                <span className="absolute inset-0 rounded-2xl border-2 border-blue-300/30" />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}

        {/* Dropdown user */}
        <div>
          <button
            onClick={() => setOpenUser(!openUser)}
            className={`w-full text-left rounded-2xl px-4 py-3 text-lg font-medium transition ${
              openUser
                ? 'bg-white/15 text-white'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>Quản lý người dùng</span>
              <span>{openUser ? '▲' : '▼'}</span>
            </div>
          </button>

          {openUser && (
            <div className="mt-1 flex flex-col space-y-1">
              <Link
                to="/admin/sinh-vien"
                className={`block rounded-2xl px-4 py-2 text-base transition ${
                  location.pathname === '/admin/sinh-vien'
                    ? 'bg-white/15 text-white'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                Sinh viên
              </Link>

              <Link
                to="/admin/nhan-vien"
                className={`block rounded-2xl px-4 py-2 text-base transition ${
                  location.pathname === '/admin/nhan-vien'
                    ? 'bg-white/15 text-white'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                Nhân viên
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-8">
        <button
          onClick={handleLogout}
          className="w-full rounded-2xl bg-[#8FB3DB] px-5 py-4 text-left text-lg font-medium text-white transition hover:opacity-90">
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;