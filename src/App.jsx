import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Roulette from './pages/Roulette';
import TruthOrDare from './pages/TruthOrDare';
import Pictionary from './pages/Pictionary';

// Komponen pembungkus untuk menyembunyikan Navbar secara dinamis
function Layout() {
  const location = useLocation();

  // LOGIKA BARU: Cek apakah path saat ini adalah /pictionary ATAU /tod
  const hideNavbar = location.pathname === '/pictionary' || location.pathname === '/tod';

  return (
    <div className="mobile-container">
      {/* Navbar HANYA muncul jika hideNavbar bernilai false */}
      {!hideNavbar && (
        <nav className="navbar">
          <Link to="/" className="nav-link">🏠</Link>
          <Link to="/roulette" className="nav-link">🎯 Roul</Link>
          <Link to="/tod" className="nav-link">🃏 T.O.D</Link>
          <Link to="/pictionary" className="nav-link">🎨 Tebak</Link>
        </nav>
      )}

      {/* Sesuaikan padding agar layar lega saat navbar disembunyikan */}
      <div className="content-area" style={{ padding: hideNavbar ? '10px' : '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/roulette" element={<Roulette />} />
          <Route path="/tod" element={<TruthOrDare />} />
          <Route path="/pictionary" element={<Pictionary />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
