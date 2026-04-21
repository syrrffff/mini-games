import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Roulette from './pages/Roulette';
import TruthOrDare from './pages/TruthOrDare';
import Pictionary from './pages/Pictionary';
import TalkNChill from './pages/TalkNChill'; // Import game baru

export default function App() {
  return (
    <Router>
      <div className="mobile-container">
        {/* Navbar sudah dihilangkan sepenuhnya sesuai permintaan */}
        <div className="content-area" style={{ padding: '15px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roulette" element={<Roulette />} />
            <Route path="/tod" element={<TruthOrDare />} />
            <Route path="/pictionary" element={<Pictionary />} />
            <Route path="/talknchill" element={<TalkNChill />} /> {/* Route baru */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}
