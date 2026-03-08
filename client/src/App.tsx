import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import QuanLySan from './pages/Quanlysan';
import CauHinhSanBai from './pages/Cauhinhsanbai';
import NotFoundPage from './pages/NotFoundPage';


const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#111827] p-3">
        <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1450px] overflow-hidden rounded-[28px] bg-[#E9EDF5] shadow-2xl">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/quan-ly-san" element={<QuanLySan />} />
              <Route path="/cau-hinh-san-bai" element={<CauHinhSanBai />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
};


export default App;













