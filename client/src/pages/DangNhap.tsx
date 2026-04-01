import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { AxiosError } from 'axios';

const DangNhap: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrMSSV: '',
    matKhau: '',
  });
  const [errors, setErrors] = useState({
    emailOrMSSV: '',
    matKhau: '',
  });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors = {
      emailOrMSSV: '',
      matKhau: '',
    };
    let isValid = true;

    if (!formData.emailOrMSSV) {
      newErrors.emailOrMSSV = 'Vui lòng nhập Email hoặc MSSV';
      isValid = false;
    }

    if (!formData.matKhau) {
      newErrors.matKhau = 'Vui lòng nhập mật khẩu';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.dangNhap({
        username: formData.emailOrMSSV,
        matKhau: formData.matKhau,
      });

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      const maVaiTro = data.user.maVaiTro;
      if (maVaiTro === 1) {
        navigate('/admin');
      } else if (maVaiTro === 3) {
        navigate('/employee/checkin');
      } else {
        navigate('/student/dat-san');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message;

      if (status === 401) {
        setServerError('Sai tài khoản hoặc mật khẩu');
      } else if (status === 403) {
        setServerError(
          message || 'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ với quản lý để mở khóa quyền truy cập.'
        );
      } else {
        setServerError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#111827] to-[#1f2937] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#3E5D99] text-xl font-bold">
              DUE
            </div>
            <h1 className="text-3xl font-bold text-white">Đăng nhập</h1>
          </div>
          <p className="text-white/70">Chào mừng trở lại!</p>
        </div>

        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-8">
          {serverError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/MSSV */}
            <div>
              <label htmlFor="emailOrMSSV" className="mb-2 block text-sm font-medium text-white">
                Email / Mã sinh viên *
              </label>
              <input
                type="text"
                id="emailOrMSSV"
                name="emailOrMSSV"
                value={formData.emailOrMSSV}
                onChange={handleChange}
                placeholder="Nhập Email hoặc MSSV"
                className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.emailOrMSSV ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.emailOrMSSV && <p className="mt-1 text-sm text-red-400">{errors.emailOrMSSV}</p>}
            </div>

            {/* Mật khẩu */}
            <div>
              <label htmlFor="matKhau" className="mb-2 block text-sm font-medium text-white">
                Mật khẩu *
              </label>
              <input
                type="password"
                id="matKhau"
                name="matKhau"
                value={formData.matKhau}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.matKhau ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.matKhau && <p className="mt-1 text-sm text-red-400">{errors.matKhau}</p>}
            </div>

            {/* Quên mật khẩu */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate('/quen-mat-khau')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-[#3E5D99] to-[#36558F] px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-white/70">
              Chưa có tài khoản?{' '}
              <button
                onClick={() => navigate('/dang-ky')}
                className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              ← Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangNhap;
