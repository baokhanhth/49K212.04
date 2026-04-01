import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuenMatKhau: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@due\.edu\.vn$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email phải có đuôi @due.edu.vn');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // TODO: Call API to send reset password email
      // const response = await api.post('/auth/forgot-password', { email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
    } catch (error) {
      console.error('Lỗi gửi email khôi phục:', error);
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#111827] to-[#1f2937] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#3E5D99] text-xl font-bold">
              DUE
            </div>
            <h1 className="text-3xl font-bold text-white">Quên mật khẩu</h1>
          </div>
          <p className="text-white/70">
            {success 
              ? 'Email khôi phục đã được gửi!' 
              : 'Nhập email để nhận liên kết đặt lại mật khẩu'}
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-8">
          {!success ? (
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
                  value={email}
                  onChange={handleChange}
                  placeholder="example@due.edu.vn"
                  className={`w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    error ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-[#FF9800] to-[#F57C00] px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-4xl">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Kiểm tra email của bạn
                </h3>
                <p className="text-white/70">
                  Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <span className="font-semibold text-white">{email}</span>
                </p>
              </div>
              <button
                onClick={() => navigate('/dang-nhap')}
                className="w-full rounded-lg bg-gradient-to-r from-[#3E5D99] to-[#36558F] px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                Quay lại đăng nhập
              </button>
            </div>
          )}

          {/* Back to login */}
          {!success && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/dang-nhap')}
                className="text-white/70 hover:text-white transition-colors"
              >
                ← Quay lại đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuenMatKhau;
