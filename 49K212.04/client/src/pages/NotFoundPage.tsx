import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Trang không tồn tại</p>
      <Link
        to="/"
        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Về trang chủ
      </Link>
    </div>
  );
};

export default NotFoundPage;
