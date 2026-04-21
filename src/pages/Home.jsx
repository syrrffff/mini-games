import { Link } from 'react-router-dom';
import { FaReact } from "react-icons/fa";

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '30px', paddingBottom: '30px', minHeight: '85vh', display: 'flex', flexDirection: 'column' }}>

      {/* --- BAGIAN ATAS: Konten Utama --- */}
      <div style={{ flex: 1 }}>
        {/* Logo & Judul */}
        <div style={{ fontSize: '50px', marginBottom: '10px' }}>🍻</div>
        <h1 style={{ fontWeight: 800, letterSpacing: '1px', marginBottom: '10px' }}>
          CIRCLE<span style={{ color: '#3b82f6' }}>GAMES</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', padding: '0 20px' }}>
          Kumpulan game simpel pemecah kecanggungan. Putar roda, bongkar rahasia, atau sekadar deep talk malam ini!
        </p>

        {/* Daftar Game (Bisa Diklik) */}
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '15px', padding: '0 10px' }}>

          {/* GAME 1: Roulette */}
          <Link to="/roulette" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', border: '2px solid #334155', borderLeft: '6px solid #3b82f6', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '16px' }}>🎯 Spinner Wheels</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Random name picker.</p>
              </div>
              <span style={{ color: '#3b82f6', fontSize: '20px', fontWeight: 'bold' }}>›</span>
            </div>
          </Link>

          {/* GAME 2: Truth or Dare */}
          <Link to="/tod" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', border: '2px solid #334155', borderLeft: '6px solid #ef4444', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '16px' }}>🃏 Truth or Dare</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Jujur atau jalankan tantangan random.</p>
              </div>
              <span style={{ color: '#ef4444', fontSize: '20px', fontWeight: 'bold' }}>›</span>
            </div>
          </Link>

          {/* GAME 3: Tebak Gambar */}
          <Link to="/pictionary" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', border: '2px solid #334155', borderLeft: '6px solid #22c55e', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '16px' }}>🎨 Tebak Gambar</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Gambar, tebak, dan rebut poin tertinggi.</p>
              </div>
              <span style={{ color: '#22c55e', fontSize: '20px', fontWeight: 'bold' }}>›</span>
            </div>
          </Link>

          {/* GAME 4: Talk n Chill (BARU) */}
          <Link to="/talknchill" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', border: '2px solid #334155', borderLeft: '6px solid #a855f7', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '16px' }}>💬 Talk n Chill</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Kartu obrolan deep talk & opini seru.</p>
              </div>
              <span style={{ color: '#a855f7', fontSize: '20px', fontWeight: 'bold' }}>›</span>
            </div>
          </Link>

        </div>
      </div>

      {/* INJECT CSS ANIMASI UNTUK ICON REACT */}
      <style>{`
        @keyframes spinReact {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .react-spin {
          animation: spinReact 4s linear infinite;
        }
      `}</style>

      {/* --- BAGIAN BAWAH: Footer --- */}
      <div style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #334155', fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          Dibuat dengan <FaReact className="react-spin" style={{ color: '#61dafb', fontSize: '16px' }} /> oleh{' '}
          <a href="https://instagram.com/syrrffff" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>
            @syrrffff
          </a>
        </p>

        <p style={{ margin: 0 }}>
          💻 Source code tersedia di{' '}
          <a href="https://github.com/USERNAME_GITHUB_KAMU" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'underline' }}>
            GitHub
          </a>
        </p>

        <p style={{ margin: '10px 0 0 0', fontStyle: 'italic', fontSize: '11px' }}>
          🐛 Punya ide game baru atau nemu bug? Jangan sungkan lapor via DM IG ya!
        </p>
      </div>

    </div>
  );
}
