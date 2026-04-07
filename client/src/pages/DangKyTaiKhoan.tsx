import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DangKyTaiKhoan: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    maSinhVien: '',
    matKhau: '',
    xacNhanMatKhau: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    maSinhVien: '',
    matKhau: '',
    xacNhanMatKhau: '',
  });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@due\.udn\.vn$/;
    return emailRegex.test(email);
  };

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
      email: '',
      maSinhVien: '',
      matKhau: '',
      xacNhanMatKhau: '',
    };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email phải có định dạng @due.udn.vn';
      isValid = false;
    }

    if (!formData.maSinhVien) {
      newErrors.maSinhVien = 'Vui lòng nhập mã sinh viên';
      isValid = false;
    } else if (!validateMSSV(formData.maSinhVien)) {
      newErrors.maSinhVien = 'Mã sinh viên phải là 12 ký tự số';
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
      // TODO: Call API to register user
      // const response = await api.post('/auth/register', formData);

      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/dang-nhap');
    } catch (error: any) {
      console.error('Lỗi đăng ký:', error);

      if (error?.response?.data?.code === 'ACCOUNT_EXISTS') {
        setServerError('Tài khoản này đã được đăng ký. Vui lòng đăng ký tài khoản khác!');
      } else if (error?.response?.data?.code === 'INVALID_PASSWORD') {
        setServerError('Mật khẩu không hợp lệ. Vui lòng nhập mật khẩu khác!');
      } else {
        setServerError('Đăng ký thất bại. Vui lòng thử lại.');
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
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@due.udn.vn"
                className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.email ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
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
                value={formData.maSinhVien}
                onChange={handleChange}
                placeholder="Nhập mã sinh viên"
                className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.maSinhVien ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.maSinhVien && <p className="mt-1 text-sm text-red-400">{errors.maSinhVien}</p>}
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