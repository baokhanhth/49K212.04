import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DatLaiMatKhau: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    matKhauMoi: '',
    xacNhanMatKhau: '',
  });

  const [errors, setErrors] = useState({
    matKhauMoi: '',
    xacNhanMatKhau: '',
  });

  const [loading, setLoading] = useState(false);

  const isValidPassword = (password: string): boolean => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = (): boolean => { 
    const newErrors = {
      matKhauMoi: '',
      xacNhanMatKhau: '',
    };

    let isValid = true;

    if (!formData.matKhauMoi.trim()) {
      newErrors.matKhauMoi = 'Vui lòng nhập mật khẩu!';
      isValid = false;
    } else if (!isValidPassword(formData.matKhauMoi)) {
      newErrors.matKhauMoi =
        'Mật khẩu không hợp lệ. Vui lòng nhập mật khẩu tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!';
      isValid = false;
    }

    if (!formData.xacNhanMatKhau.trim()) {
      newErrors.xacNhanMatKhau = 'Vui lòng nhập mật khẩu!';
      isValid = false;
    } else if (formData.xacNhanMatKhau !== formData.matKhauMoi) {
      newErrors.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp!';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      alert('Đổi mật khẩu thành công');
      navigate('/dang-nhap');
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#111827] to-[#1f2937] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl font-bold text-[#3E5D99]">
              DUE
            </div>
            <h1 className="text-3xl font-bold text-white">Đặt lại mật khẩu</h1>
          </div>
          <p className="text-white/70">Vui lòng nhập mật khẩu mới để tiếp tục</p>
        </div>

        <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="matKhauMoi"
                className="mb-2 block text-sm font-medium text-white"
              >
                Mật khẩu mới *
              </label>
              <input
                type="password"
                id="matKhauMoi"
                name="matKhauMoi"
                value={formData.matKhauMoi}
                onChange={handleChange}
                placeholder="Nhập mật khẩu mới"
                className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.matKhauMoi ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.matKhauMoi && (
                <p className="mt-1 text-sm text-red-400">{errors.matKhauMoi}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="xacNhanMatKhau"
                className="mb-2 block text-sm font-medium text-white"
              >
                Xác nhận mật khẩu *
              </label>
              <input
                type="password"
                id="xacNhanMatKhau"
                name="xacNhanMatKhau"
                value={formData.xacNhanMatKhau}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  errors.xacNhanMatKhau ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.xacNhanMatKhau && (
                <p className="mt-1 text-sm text-red-400">{errors.xacNhanMatKhau}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-[#3E5D99] to-[#36558F] px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/dang-nhap')}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              ← Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatLaiMatKhau;