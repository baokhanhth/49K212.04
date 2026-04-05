import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/select-role" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
      <img
        src="/logo.png"
        alt="N4 DUE Logo"
        className="h-12 w-12 object-contain"
      />
      <div>
        <h1 className="text-3xl font-extrabold tracking-wide">N4 DUE</h1>
        <p className="mt-1 text-sm leading-5 text-white/70">
          Hệ thống quản lý và đặt lịch sân thể thao
        </p>
      </div>
    </Link>
  );
};

export default Logo;
