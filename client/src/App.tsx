import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectRolePage from './pages/SelectRolePage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import Xemdanhsachsan from "./pages/Xemdanhsachsan";


// Student pages
import DatSan from './pages/student/DatSan';
import VeCuaToi from './pages/student/VeCuaToi';
import YeuCauDatSan from './pages/student/LichSuDatSan';
import TaiKhoanStudent from './pages/student/TaiKhoanStudent';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import DuyetDatSan from './pages/admin/DuyetDatSan';
import CauHinhSanBai from './pages/admin/CauHinhSanBai';
import QuanLySan from './pages/admin/QuanLySan';
import TaiKhoanAdmin from './pages/admin/TaiKhoanAdmin';
import QuanLyNguoiDung from './pages/admin/Quanlynguoidung';
// Common pages
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Role selection - default route */}
        <Route path="/" element={<SelectRolePage />} />
        <Route path="/select-role" element={<SelectRolePage />} />

        {/* Student routes */}
        <Route path="/student" element={<DatSan />} />
        <Route path="/student/dat-san" element={<DatSan />} />
        <Route path="/student/ve-cua-toi" element={<VeCuaToi />} />
        <Route path="/student/lich-su-dat-san" element={<YeuCauDatSan />} />
        <Route path="/student/tai-khoan" element={<TaiKhoanStudent />} />

        {/* Admin routes */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/duyet-dat-san" element={<DuyetDatSan />} />
        <Route path="/admin/cau-hinh-san-bai" element={<CauHinhSanBai />} />
        <Route path="/admin/quan-ly-san" element={<QuanLySan />} />
        <Route path="/admin/tai-khoan" element={<TaiKhoanAdmin />} />
        <Route path="/admin/sinh-vien" element={<QuanLyNguoiDung />} />

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
