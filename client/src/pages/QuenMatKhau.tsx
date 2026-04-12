import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { AxiosError } from 'axios';

const QuenMatKhau: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateSchoolEmail = (value: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@due\.udn\.vn$/;
    return emailRegex.test(value);
  };

  const clearErrors = () => {
    setEmailError('');
    setServerError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);

    if (emailError || serverError) {
      clearErrors();
    }
  };

  const validateForm = (): boolean => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError('Vui lòng nhập email');
      return false;
    }

    if (!validateSchoolEmail(normalizedEmail)) {
      setEmailError('Email trường không hợp lệ');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!validateForm()) return;

    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);

    try {
      await authApi.quenMatKhau(normalizedEmail);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/dat-lai-mat-khau?email=${encodeURIComponent(normalizedEmail)}`);
      }, 2000);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; code?: string }>;
      const data = axiosError.response?.data;

      if (data?.code === 'EMAIL_NOT_FOUND' || axiosError.response?.status === 404) {
        setEmailError('Email không tồn tại');
      } else if (data?.code === 'PERSONAL_EMAIL_MISSING') {
        setServerError('Vui lòng cập nhật email cá nhân trong hồ sơ để khôi phục mật khẩu');
      } else {
        setServerError(data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#111827] to-[#1f2937] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <img
              src="/logo.png"
              alt="DUE Logo"
              className="h-12 w-12 rounded-xl object-contain"
            />
            <h1 className="text-3xl font-bold text-white">Quên mật khẩu</h1>
          </div>

          <p className="text-white/70">
            {success
              ? 'Mã OTP đã được gửi đến email của bạn'
              : 'Nhập email trường đã đăng ký để khôi phục mật khẩu'}
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Email trường <span className="text-red-400">*</span>
                </label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="example@due.udn.vn"
                  disabled={loading}
                  className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${emailError
                      ? 'border-red-500 focus:ring-red-500/40'
                      : 'border-white/20 focus:border-blue-500 focus:ring-blue-500/50'
                    }`}
                />

                {emailError && (
                  <p className="mt-1 text-sm text-red-400">{emailError}</p>
                )}
              </div>

              {serverError && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-[#FF9800] to-[#F57C00] px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/dang-nhap')}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  ← Quay lại đăng nhập
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-4xl text-green-400">
                  ✓
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  Gửi OTP thành công
                </h3>
                <p className="text-white/70">
                  Mã OTP đã được gửi đến email của bạn. Hệ thống sẽ tự động chuyển sang trang đặt lại mật khẩu.
                </p>
              </div>

              <button
                onClick={() => navigate(`/dat-lai-mat-khau?email=${encodeURIComponent(email.trim().toLowerCase())}`)}
                className="w-full rounded-lg bg-gradient-to-r from-[#3E5D99] to-[#36558F] px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                Nhập mã OTP ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuenMatKhau;