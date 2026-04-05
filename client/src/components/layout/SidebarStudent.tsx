import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../common/Logo";
import { authApi } from "../../services/api";

const SidebarStudent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.dangXuat();
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/dang-nhap");
  };

  const menuItems = [
    { label: "Đặt sân", path: "/student/dat-san" },
    { label: "Vé của tôi", path: "/student/ve-cua-toi" },
    { label: "Lịch sử đặt sân", path: "/student/lich-su-dat-san" },
    { label: "Tài khoản", path: "/student/tai-khoan" },
  ];

  return (
    <aside className="flex w-[250px] flex-col bg-gradient-to-b from-[#3E5D99] to-[#36558F] px-6 py-7 text-white">
      
      <div className="mb-10">
        <Logo />
      </div>

      <nav className="space-y-3">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`relative block rounded-2xl px-4 py-3 text-lg font-medium transition ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute inset-0 rounded-2xl border-2 border-blue-300/30" />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <button
          onClick={handleLogout}
          className="w-full rounded-2xl bg-[#8FB3DB] px-5 py-4 text-left text-lg font-medium text-white transition hover:opacity-90"
        >
          Đăng xuất
        </button>
      </div>

    </aside>
  );
};

export default SidebarStudent;