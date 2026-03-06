import { useEffect, useState } from 'react';
import api from '../services/api';

interface ApiStatus {
  message: string;
  version: string;
}

const HomePage: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const data = await api.get<ApiStatus>('/');
        setApiStatus(data as unknown as ApiStatus);
      } catch {
        setApiStatus(null);
      } finally {
        setLoading(false);
      }
    };
    checkApi();
  }, []);

  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        ⚽ Chào mừng đến với Football Web
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Hệ thống quản lý bóng đá trực tuyến
      </p>

      {/* API Status */}
      <div className="mb-8 p-4 rounded-lg inline-block">
        {loading ? (
          <p className="text-gray-500">🔄 Đang kiểm tra kết nối API...</p>
        ) : apiStatus ? (
          <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg">
            <p className="font-semibold">✅ API Connected</p>
            <p className="text-sm">{apiStatus.message} - v{apiStatus.version}</p>
          </div>
        ) : (
          <div className="bg-red-100 text-red-800 px-6 py-3 rounded-lg">
            <p className="font-semibold">❌ API Disconnected</p>
            <p className="text-sm">Không thể kết nối tới server</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Bắt đầu
        </button>
        <button className="border-2 border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
          Tìm hiểu thêm
        </button>
      </div>
    </div>
  );
};

export default HomePage;
