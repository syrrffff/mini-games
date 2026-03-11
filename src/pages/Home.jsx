export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <div style={{ fontSize: '50px', marginBottom: '10px' }}>🍻</div>
      <h1 style={{ fontWeight: 800, letterSpacing: '1px', marginBottom: '10px' }}>
        CIRCLE<span style={{ color: '#3b82f6' }}>GAMES</span>
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', padding: '0 20px' }}>
        Kumpulan game simpel pemecah kecanggungan. Tentukan siapa yang bayar, siapa yang jujur, dan siapa yang kena mental malam ini!
      </p>

      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ background: '#0f172a', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #3b82f6', textAlign: 'left' }}>
          <h4 style={{ margin: '0 0 5px 0' }}>🎯 Roulette</h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Putar roda, tentukan tumbal secara acak.</p>
        </div>
        <div style={{ background: '#0f172a', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #ef4444', textAlign: 'left' }}>
          <h4 style={{ margin: '0 0 5px 0' }}>🃏 Truth or Dare</h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Jujur atau jalankan tantangan konyol.</p>
        </div>
      </div>
    </div>
  );
}
