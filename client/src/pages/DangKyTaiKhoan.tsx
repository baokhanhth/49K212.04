import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { AxiosError } from 'axios';

const DangKyTaiKhoan: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hoTen: '',
    maSinhVien: '',
    lop: '',
    emailCaNhan: '',
    matKhau: '',
    xacNhanMatKhau: '',
  });
  const [errors, setErrors] = useState({
    hoTen: '',
    maSinhVien: '',
    lop: '',
    emailCaNhan: '',
    matKhau: '',
    xacNhanMatKhau: '',
  });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const validateMSSV = (mssv: string): boolean => {
    return /^\d{12}$/.test(mssv);
  };

  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasNoSpaces = !/\s/.test(password);

    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && hasNoSpaces;
  };

  const validateForm = (): boolean => {
    const newErrors = {
      hoTen: '',
      maSinhVien: '',
      lop: '',
      emailCaNhan: '',
      matKhau: '',
      xacNhanMatKhau: '',
    };
    let isValid = true;

    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Vui lòng nhập họ tên';
      isValid = false;
    }

    if (!formData.maSinhVien) {
      newErrors.maSinhVien = 'Vui lòng nhập mã sinh viên';
      isValid = false;
    } else if (!validateMSSV(formData.maSinhVien)) {
      newErrors.maSinhVien = 'Mã sinh viên phải là 12 ký tự số';
      isValid = false;
    }

    if (!formData.lop.trim()) {
      newErrors.lop = 'Vui lòng nhập lớp';
      isValid = false;
    }

    if (!formData.emailCaNhan.trim()) {
      newErrors.emailCaNhan = 'Vui lòng nhập email cá nhân';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailCaNhan.trim())) {
      newErrors.emailCaNhan = 'Email cá nhân không hợp lệ';
      isValid = false;
    }

    if (!formData.matKhau) {
      newErrors.matKhau = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (!validatePassword(formData.matKhau)) {
      newErrors.matKhau = 'Mật khẩu không hợp lệ. Vui lòng nhập mật khẩu khác!';
      isValid = false;
    }

    if (!formData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (formData.matKhau !== formData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';
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
      await authApi.dangKy({
        hoTen: formData.hoTen.trim(),
        username: formData.maSinhVien + '@due.udn.vn',
        msv: formData.maSinhVien,
        lop: formData.lop.trim(),
        emailTruong: formData.maSinhVien + '@due.udn.vn',
        matKhau: formData.matKhau,
        xacNhanMatKhau: formData.xacNhanMatKhau,
        emailCaNhan: formData.emailCaNhan.trim(),
      });

      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/dang-nhap');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string | string[]; code?: string }>;
      const data = axiosError.response?.data;

      if (data?.code === 'ACCOUNT_EXISTS' || axiosError.response?.status === 409) {
        setServerError('Tài khoản này đã được đăng ký. Vui lòng đăng ký tài khoản khác!');
      } else if (data?.message) {
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        setServerError(msg);
      } else {
        setServerError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = name === 'maSinhVien' ? value.replace(/\D/g, '').slice(0, 12) : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
    setServerError('');
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
            <h1 className="text-3xl font-bold text-white">Đăng ký</h1>
          </div>
          <p className="text-white/70">Tạo tài khoản mới để sử dụng dịch vụ</p>
        </div>

        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-8">
          {serverError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Họ tên */}
            <div>
              <label htmlFor="hoTen" className="mb-2 block text-sm font-medium text-white">
                Họ tên *
              </label>
              <input
                type="text"
                id="hoTen"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.hoTen ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.hoTen && <p className="mt-1 text-sm text-red-400">{errors.hoTen}</p>}
            </div>

            {/* Mã sinh viên */}
            <div>
              <label htmlFor="maSinhVien" className="mb-2 block text-sm font-medium text-white">
                Mã sinh viên *
              </label>
              <input
                type="text"
                id="maSinhVien"
                name="maSinhVien"
                inputMode="numeric"
                maxLength={12}
                value={formData.maSinhVien}
                onChange={handleChange}
                placeholder="VD: 012345678901 (12 chữ số)"
                className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.maSinhVien ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.maSinhVien && <p className="mt-1 text-sm text-red-400">{errors.maSinhVien}</p>}
            </div>

            {/* Email trường (auto-generated) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Email trường
              </label>
              <div className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white/70">
                {formData.maSinhVien && validateMSSV(formData.maSinhVien)
                  ? `${formData.maSinhVien}@due.udn.vn`
                  : 'Tự động tạo từ mã sinh viên'}
              </div>
            </div>

            {/* Lớp */}
            <div>
              <label htmlFor="lop" className="mb-2 block text-sm font-medium text-white">
                Lớp *
              </label>
              <input
                type="text"
                id="lop"
                name="lop"
                value={formData.lop}
                onChange={handleChange}
                placeholder="VD: 48K21.1"
                className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.lop ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.lop && <p className="mt-1 text-sm text-red-400">{errors.lop}</p>}
            </div>

            {/* Email cá nhân */}
            <div>
              <label htmlFor="emailCaNhan" className="mb-2 block text-sm font-medium text-white">
                Email cá nhân *
              </label>
              <input
                type="email"
                id="emailCaNhan"
                name="emailCaNhan"
                value={formData.emailCaNhan}
                onChange={handleChange}
                placeholder="nguyenvana@gmail.com"
                className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.emailCaNhan ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.emailCaNhan && <p className="mt-1 text-sm text-red-400">{errors.emailCaNhan}</p>}
            </div>

            {/* Mật khẩu — có custom tooltip */}
            <div>
              <label htmlFor="matKhau" className="mb-2 block text-sm font-medium text-white">
                Mật khẩu *
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="matKhau"
                  name="matKhau"
                  value={formData.matKhau}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onFocus={() => setShowTooltip(true)}
                  onBlur={() => setShowTooltip(false)}
                  className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    errors.matKhau ? 'border-red-500' : 'border-white/20'
                  }`}
                />

                {/* Custom Tooltip */}
                {showTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 z-10 w-full rounded-lg border border-white/20 bg-[#1f2937] px-4 py-3 text-sm text-white shadow-lg">
                    <div className="flex items-start gap-2">
                      <span>
                        Mật khẩu phải bao gồm ít nhất 8 chữ ký tự, bao gồm ít nhất 1 chữ cái in hoa, 1 chữ cái in thường, 1 chữ số và 1 ký tự đặc biệt
                      </span>
                    </div>
                    {/* Mũi tên tooltip */}
                    <div className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-b border-r border-white/20 bg-[#1f2937]" />
                  </div>
                )}
              </div>
              {errors.matKhau && <p className="mt-1 text-sm text-red-400">{errors.matKhau}</p>}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label htmlFor="xacNhanMatKhau" className="mb-2 block text-sm font-medium text-white">
                Xác nhận mật khẩu *
              </label>
              <input
                type="password"
                id="xacNhanMatKhau"
                name="xacNhanMatKhau"
                value={formData.xacNhanMatKhau}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.xacNhanMatKhau ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.xacNhanMatKhau && <p className="mt-1 text-sm text-red-400">{errors.xacNhanMatKhau}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-[#4CAF50] to-[#45a049] px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-white/70 hover:text-white transition-colors"
            >
              ← Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangKyTaiKhoan;