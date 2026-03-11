import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Roulette from './pages/Roulette';
import TruthOrDare from './pages/TruthOrDare';
import Pictionary from './pages/Pictionary'; // Tambahkan ini

function App() {
  return (
    <Router>
      <div className="mobile-container">
        <nav className="navbar">
          <Link to="/" className="nav-link">🏠</Link>
          <Link to="/roulette" className="nav-link">🎯 Roul</Link>
          <Link to="/tod" className="nav-link">🃏 T.O.D</Link>
          <Link to="/pictionary" className="nav-link">🎨 Tebak</Link> {/* Tambahkan ini */}
        </nav>

        <div className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roulette" element={<Roulette />} />
            <Route path="/tod" element={<TruthOrDare />} />
            <Route path="/pictionary" element={<Pictionary />} /> {/* Tambahkan ini */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
