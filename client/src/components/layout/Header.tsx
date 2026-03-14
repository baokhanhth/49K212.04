import { Link, useLocation } from 'react-router-dom';


const Header: React.FC = () => {
  const location = useLocation();
  const menuItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Duyệt đặt sân', path: '/duyet-dat-san' },
    { label: 'Quản lý sân', path: '/quan-ly-san' },
    { label: 'Tài khoản', path: '/tai-khoan' },
  ];


  return (
    <aside className="flex w-[250px] flex-col bg-gradient-to-b from-[#3E5D99] to-[#36558F] px-6 py-7 text-white">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#3E5D99] font-bold">
            DUE
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide">N4 DUE</h1>
            <p className="mt-1 text-sm leading-5 text-white/70">
              Hệ thống quản lý và đặt lịch sân thể thao
            </p>
          </div>
        </div>
      </div>


      <nav className="space-y-3">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;


          return (
            <Link
              key={item.label}
              to={item.path}
              className={`block rounded-2xl px-4 py-3 text-lg font-medium transition ${
                active
                  ? 'bg-white/18 text-white shadow-sm'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>


      <div className="mt-auto pt-8">
        <button className="w-full rounded-2xl bg-[#8FB3DB] px-5 py-4 text-left text-lg font-medium text-white transition hover:opacity-90">
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};


export default Header;
