import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-wide">
          ⚽ Football Web
        </Link>
        <nav className="flex gap-6">
          <Link to="/xem-san" className="hover:text-accent transition-colors">
  Xem danh sách sân
</Link>
          <Link to="/" className="hover:text-accent transition-colors">
            Trang chủ
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
