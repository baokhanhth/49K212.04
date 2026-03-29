import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth & common pages
import HomePage from './pages/HomePage';
import DangKyTaiKhoan from './pages/DangKyTaiKhoan';
import DangNhap from './pages/DangNhap';
import QuenMatKhau from './pages/QuenMatKhau';
import DatLaiMatKhau from './pages/Datlaimatkhau';
import SelectRolePage from './pages/SelectRolePage';
import NotFoundPage from './pages/NotFoundPage';

// Student pages
import DatSan from './pages/student/DatSan';
import VeCuaToi from './pages/student/VeCuaToi';
import LichSuDatSan from './pages/student/LichSuDatSan';
import TaiKhoanStudent from './pages/student/TaiKhoanStudent';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import DuyetDatSan from './pages/admin/DuyetDatSan';
import CauHinhSanBai from './pages/admin/CauHinhSanBai';
import QuanLySan from './pages/admin/QuanLySan';
import TaiKhoanAdmin from './pages/admin/TaiKhoanAdmin';
import QuanLySinhVien from './pages/admin/QuanLySinhVien';
import QuanLyNhanVien from './pages/admin/QuanLyNhanVien';

// Employee pages
import Checkin from './pages/employee/Checkin';
import XacNhanThanhToan from './pages/employee/XacNhanThanhToan';
import TaiKhoanEmployee from './pages/employee/TaiKhoan';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<DatLaiMatKhau />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dang-ky" element={<DangKyTaiKhoan />} />
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/quen-mat-khau" element={<QuenMatKhau />} />
        <Route path="/dat-lai-mat-khau" element={<DatLaiMatKhau />} />

        {/* Role selection */}
        <Route path="/select-role" element={<SelectRolePage />} />

        {/* Student */}
        <Route path="/student" element={<DatSan />} />
        <Route path="/student/dat-san" element={<DatSan />} />
        <Route path="/student/ve-cua-toi" element={<VeCuaToi />} />
        <Route path="/student/lich-su-dat-san" element={<LichSuDatSan />} />
        <Route path="/student/tai-khoan" element={<TaiKhoanStudent />} />

        {/* Admin */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/duyet-dat-san" element={<DuyetDatSan />} />
        <Route path="/admin/cau-hinh-san-bai" element={<CauHinhSanBai />} />
        <Route path="/admin/quan-ly-san" element={<QuanLySan />} />
        <Route path="/admin/tai-khoan" element={<TaiKhoanAdmin />} />
        <Route path="/admin/sinh-vien" element={<QuanLySinhVien />} />
        <Route path="/admin/nhan-vien" element={<QuanLyNhanVien />} />

        {/* Employee */}
        <Route path="/employee" element={<Checkin />} />
        <Route path="/employee/checkin" element={<Checkin />} />
        <Route path="/employee/xac-nhan-thanh-toan" element={<XacNhanThanhToan />} />
        <Route path="/employee/tai-khoan" element={<TaiKhoanEmployee />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;