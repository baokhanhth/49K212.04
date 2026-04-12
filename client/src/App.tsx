import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth & common pages
import HomePage from './pages/HomePage';
import DangKyTaiKhoan from './pages/DangKyTaiKhoan';
import DangNhap from './pages/DangNhap';
import QuenMatKhau from './pages/QuenMatKhau';
import DatLaiMatKhau from './pages/Datlaimatkhau';
import SelectRolePage from './pages/SelectRolePage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/common/PrivateRoute';

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
        <Route path="/" element={<HomePage />} />
        <Route path="/dang-ky" element={<DangKyTaiKhoan />} />
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/quen-mat-khau" element={<QuenMatKhau />} />
        <Route path="/dat-lai-mat-khau" element={<DatLaiMatKhau />} />

        {/* Role selection */}
        <Route path="/select-role" element={<SelectRolePage />} />

        {/* Student (maVaiTro = 2) */}
        <Route path="/student" element={<PrivateRoute allowedRoles={[2]}><DatSan /></PrivateRoute>} />
        <Route path="/student/dat-san" element={<PrivateRoute allowedRoles={[2]}><DatSan /></PrivateRoute>} />
        <Route path="/student/ve-cua-toi" element={<PrivateRoute allowedRoles={[2]}><VeCuaToi /></PrivateRoute>} />
        <Route path="/student/lich-su-dat-san" element={<PrivateRoute allowedRoles={[2]}><LichSuDatSan /></PrivateRoute>} />
        <Route path="/student/tai-khoan" element={<PrivateRoute allowedRoles={[2]}><TaiKhoanStudent /></PrivateRoute>} />

        {/* Admin (maVaiTro = 1) */}
        <Route path="/admin" element={<PrivateRoute allowedRoles={[1]}><Dashboard /></PrivateRoute>} />
        <Route path="/admin/duyet-dat-san" element={<PrivateRoute allowedRoles={[1]}><DuyetDatSan /></PrivateRoute>} />
        <Route path="/admin/cau-hinh-san-bai" element={<PrivateRoute allowedRoles={[1]}><CauHinhSanBai /></PrivateRoute>} />
        <Route path="/admin/quan-ly-san" element={<PrivateRoute allowedRoles={[1]}><QuanLySan /></PrivateRoute>} />
        <Route path="/admin/tai-khoan" element={<PrivateRoute allowedRoles={[1]}><TaiKhoanAdmin /></PrivateRoute>} />
        <Route path="/admin/sinh-vien" element={<PrivateRoute allowedRoles={[1]}><QuanLySinhVien /></PrivateRoute>} />
        <Route path="/admin/nhan-vien" element={<PrivateRoute allowedRoles={[1]}><QuanLyNhanVien /></PrivateRoute>} />

        {/* Employee (maVaiTro = 3) */}
        <Route path="/employee" element={<PrivateRoute allowedRoles={[3]}><Checkin /></PrivateRoute>} />
        <Route path="/employee/checkin" element={<PrivateRoute allowedRoles={[3]}><Checkin /></PrivateRoute>} />
        <Route path="/employee/xac-nhan-thanh-toan" element={<PrivateRoute allowedRoles={[3]}><XacNhanThanhToan /></PrivateRoute>} />
        <Route path="/employee/tai-khoan" element={<PrivateRoute allowedRoles={[3]}><TaiKhoanEmployee /></PrivateRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;