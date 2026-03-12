import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import Xemdanhsachsan from "./pages/Xemdanhsachsan";
import Lichsudatsan from "./pages/Lichsudatsan";
const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/xem-san" element={<Xemdanhsachsan />} />
            <Route path="/lich-su-dat-san" element={<Lichsudatsan />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
