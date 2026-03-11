import { Link } from 'react-router-dom';

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
          Kumpulan game simpel pemecah kecanggungan. Tentukan siapa yang bayar, siapa yang jujur, dan siapa yang paling jago nebak malam ini!
        </p>

        {/* Daftar Game (Bisa Diklik) */}
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '15px', padding: '0 10px' }}>

          {/* GAME 1: Roulette */}
          <Link to="/roulette" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: '#1e293b', padding: '15px', borderRadius: '8px',
              border: '2px solid #334155', borderLeft: '6px solid #3b82f6',
              textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '16px' }}>🎯 Roulette</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Putar roda, tentukan tumbal secara acak.</p>
              </div>
              <span style={{ color: '#3b82f6', fontSize: '20px', fontWeight: 'bold' }}>›</span>
            </div>
          </Link>

          {/* GAME 2: Truth or Dare */}
          <Link to="/tod" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: '#1e293b', padding: '15px', borderRadius: '8px',
              border: '2px solid #334155', borderLeft: '6px solid #ef4444',
              textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '16px' }}>🃏 Truth or Dare</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Jujur atau jalankan tantangan konyol.</p>
              </div>
              <span style={{ color: '#ef4444', fontSize: '20px', fontWeight: 'bold' }}>›</span>
            </div>
          </Link>

          {/* GAME 3: Tebak Gambar */}
          <Link to="/pictionary" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: '#1e293b', padding: '15px', borderRadius: '8px',
              border: '2px solid #334155', borderLeft: '6px solid #22c55e',
              textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '16px' }}>🎨 Tebak Gambar</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Gambar, tebak, dan rebut poin tertinggi.</p>
              </div>
              <span style={{ color: '#22c55e', fontSize: '20px', fontWeight: 'bold' }}>›</span>
            </div>
          </Link>

        </div>
      </div>

      {/* --- BAGIAN BAWAH: Footer --- */}
      <div style={{
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '1px solid #334155',
        fontSize: '12px',
        color: '#64748b',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <p style={{ margin: 0 }}>
          Dibuat dengan ☕ oleh{' '}
          <a
            href="https://instagram.com/syrrffff"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}
          >
            @syrrffff
          </a>
        </p>

        <p style={{ margin: 0 }}>
          💻 Source code tersedia di{' '}
          <a
            href="https://github.com/syrrffff/mini-games"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#94a3b8', textDecoration: 'underline' }}
          >
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
