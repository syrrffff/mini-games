import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

// --- DATABASE PERTANYAAN ---
// --- DATABASE PERTANYAAN (VERSI LENGKAP - 30+ TRUTH & 30+ DARE) ---
const PROMPTS = {
  truth: [
    // Tema: Rahasia & Aib
    "[PLAYER], kebohongan apa yang terakhir kali lu lakuin?",
    "[PLAYER], hal paling memalukan apa yang pernah lu alamin di sekolah/kampus?",
    "[PLAYER], berapa lama rekor lu nggak mandi, dan apa alasannya?",
    "[PLAYER], pernah nyolong barang nggak? Kalau pernah, barang apa dan punya siapa?",
    "[PLAYER], hal paling jorok yang sering lu lakuin pas lagi sendirian di kamar?",
    "[PLAYER], kebohongan terbesar yang pernah lu bilang ke orang tua?",
    "[PLAYER], apa insecurity atau rasa ga pede terbesar lu saat ini?",
    "[PLAYER], pernah kentut diem-diem trus nyalahin orang lain? Siapa korbannya?",
    "[PLAYER], hal apa yang paling lu takutin orang di ruangan ini tau tentang diri lu?",
    "[PLAYER], pernah pura-pura sakit buat ngehindarin acara/janji? Janji sama siapa?",

    // Tema: Asmara & Gebetan
    "[PLAYER], jujur, lu pernah naksir nggak sama [TARGET_LAWAN_JENIS]?",
    "[PLAYER], ceritain detail isi chat terakhir lu sama mantan terindah!",
    "[PLAYER], pernah naksir pacar temen sendiri nggak? Siapa namanya?",
    "[PLAYER], kalau [TARGET_LAWAN_JENIS] nembak lu hari ini, lu bakal terima atau tolak? Kasih alasannya!",
    "[PLAYER], apa penyesalan terbesar lu dalam urusan asmara selama ini?",
    "[PLAYER], momen paling canggung yang pernah lu alamin pas lagi kencan pertama?",
    "[PLAYER], pernah stalk mantan dari akun fake nggak? Momen pas lagi ngapain?",
    "[PLAYER], fantasi terliar lu dalam hal romansa yang belum kesampaian?",
    "[PLAYER], sebutin 3 hal yang bikin lu ilfeel parah sama lawan jenis!",
    "[PLAYER], siapa artis/influencer yang sering lu jadiin bahan halu sebelum tidur?",

    // Tema: Persahabatan & Adu Domba Circle
    "[PLAYER], dari semua yang ada di sini, siapa yang paling sering bikin lu emosi?",
    "[PLAYER], sebutkan 1 sifat dari [TARGET_BEBAS] yang paling lu benci!",
    "[PLAYER], sebutkan urutan orang di ruangan ini dari yang paling lu suka sampe yang paling lu malesin!",
    "[PLAYER], rahasia terbesar apa yang sampe sekarang lu sembunyiin dari [TARGET_BEBAS]?",
    "[PLAYER], pendapat paling jujur dan nyelekit tentang penampilan [TARGET_BEBAS] hari ini?",
    "[PLAYER], kalau lu disuruh milih, mending pacaran sama [TARGET_BEBAS] atau jomblo seumur hidup?",
    "[PLAYER], siapa di ruangan ini yang menurut lu paling pantes dicap fakboy/fakgirl?",
    "[PLAYER], kasih tau satu rahasia [TARGET_BEBAS] yang lu tau tapi orang lain di sini belum tau!",
    "[PLAYER], siapa di antara kita yang menurut lu masa depannya paling suram kalau kelakuannya nggak berubah?",
    "[PLAYER], kalo lu bisa nuker hidup lu sama salah satu orang di ruangan ini, lu pilih siapa dan kenapa?",
    "[PLAYER], siapa orang terakhir yang lu kepoin sosmednya hari ini?"
  ],
  dare: [
    // Tema: Sabotase Fisik & HP
    "[PLAYER], biarkan [TARGET_BEBAS] menggambar sesuatu di jidat lu pake pulpen/spidol.",
    "[PLAYER], bacain chat WhatsApp urutan teratas lu dengan nyaring ke semua orang sekarang!",
    "[PLAYER], posting foto aib lu di IG Story / WA Story sekarang, kasih caption 'Lagi butuh belaian'.",
    "[PLAYER], biarkan [TARGET_BEBAS] balesin 1 story WA/IG teman lu bebas siapa aja.",
    "[PLAYER], biarkan [TARGET_BEBAS] nulis status di WA lu, dan nggak boleh dihapus selama 1 jam!",
    "[PLAYER], kasih HP lu ke [TARGET_BEBAS] biarkan dia scroll galeri foto lu selama 1 menit tanpa lu lihat!",
    "[PLAYER], biarkan [TARGET_BEBAS] ngirim chat bebas ke kontak urutan ke-5 di WA lu.",
    "[PLAYER], buka Instagram, like 5 foto lama dari akun mantan atau gebetan lu!",
    "[PLAYER], kasih unjuk history pencarian browser (Google/Safari) lu di HP sekarang juga ke semua orang!",
    "[PLAYER], kirim voice note ke grup keluarga lu bilang 'Ma/Pa, aku mau nikah bulan depan'.",

    // Tema: Interaksi Lawan Jenis & Romansa
    "[PLAYER], pura-pura jadi pacarnya [TARGET_LAWAN_JENIS] selama 3 menit.",
    "[PLAYER], peluk [TARGET_LAWAN_JENIS] selama 10 detik. Kalo malu, traktir minuman semua orang!",
    "[PLAYER], biarkan [TARGET_LAWAN_JENIS] nyuapin lu minuman pake sendok.",
    "[PLAYER], tukeran jaket/baju luar sama [TARGET_LAWAN_JENIS] selama 3 putaran ke depan.",
    "[PLAYER], tatap mata [TARGET_LAWAN_JENIS] selama 1 menit tanpa senyum atau ketawa. Kalo gagal, coret muka!",
    "[PLAYER], bikin instastory video 15 detik muji-muji kegantengan/kecantikan [TARGET_LAWAN_JENIS].",
    "[PLAYER], duduk di sebelah [TARGET_LAWAN_JENIS] sambil pegangan tangan sampai giliran lu berikutnya.",

    // Tema: Kekonyolan & Hal Aneh
    "[PLAYER], nyanyi lagu potong bebek angsa tapi vokalnya diganti 'O' semua.",
    "[PLAYER], push-up 10 kali sambil dihitungin pake bahasa Inggris sama [TARGET_BEBAS].",
    "[PLAYER], biarkan [TARGET_BEBAS] ngacak-ngacak rambut lu sampe berantakan dan biarin gitu terus selama 2 putaran.",
    "[PLAYER], berdiri di tengah ruangan dan joget TikTok yang paling lu hafal tanpa musik selama 30 detik.",
    "[PLAYER], bertingkah kaya kucing (ngeong-ngeong sambil merangkak) di depan semua orang selama 1 menit.",
    "[PLAYER], makan 1 sendok teh garam, kopi bubuk, atau kecap asin sekarang juga (pilih salah satu).",
    "[PLAYER], minum segelas air yang udah dicampur sama 3 bahan dari dapur (dipilih sama [TARGET_BEBAS]).",
    "[PLAYER], bilang 'Aku cinta kamu' ke [TARGET_BEBAS] pake nada paling sedih dan dramatis yang lu bisa.",
    "[PLAYER], lu harus ngomong pake aksen bule/Inggris sok asik setiap kali giliran lu sampai game ini selesai.",
    "[PLAYER], plank selama 1 menit. Kalau jatuh, ganti profil WA pakai foto aib lu selama 24 jam.",
    "[PLAYER], nyanyiin reff lagu dangdut pake suara paling ngebass/berat yang lu bisa.",
    "[PLAYER], lu harus panggil [TARGET_BEBAS] dengan sebutan 'Yang Mulia' sampai akhir permainan.",
    "[PLAYER], telepon nomor random dari kontak lu, pas diangkat nyanyiin 'Happy Birthday' padahal bukan ultahnya.",
    "[PLAYER], pijitin bahu [TARGET_BEBAS] selama 2 menit layaknya terapis profesional."
  ]
};

// --- GENERATOR SUARA ---
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    if (type === 'select') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'reveal') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now); osc.stop(now + 0.5);
    }
  } catch(e) { console.error("Audio error", e); }
};

export default function TruthOrDare() {
  const [players, setPlayers] = useState(() => JSON.parse(localStorage.getItem('tod_players')) || []);
  const [phase, setPhase] = useState(() => localStorage.getItem('tod_phase') || 'lobby');
  const [currentPlayer, setCurrentPlayer] = useState(() => JSON.parse(localStorage.getItem('tod_currentPlayer')) || null);
  const [activePrompt, setActivePrompt] = useState(() => localStorage.getItem('tod_activePrompt') || '');

  const [inputName, setInputName] = useState('');
  const [inputGender, setInputGender] = useState('');

  // STATE UNTUK MODAL & TOOLTIP
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMinPlayerAlert, setShowMinPlayerAlert] = useState(false); // State baru untuk Alert Minimal Pemain

  useEffect(() => {
    localStorage.setItem('tod_players', JSON.stringify(players));
    localStorage.setItem('tod_phase', phase);
    localStorage.setItem('tod_currentPlayer', JSON.stringify(currentPlayer));
    localStorage.setItem('tod_activePrompt', activePrompt);
  }, [players, phase, currentPlayer, activePrompt]);

  // --- LOGIC KELOLA PEMAIN ---
  const addPlayer = (e) => {
    e.preventDefault();
    if (!inputName.trim()) return alert("Isi nama pemain dulu bro!");
    if (!inputGender) return alert("Pilih gendernya dulu (Cowok/Cewek)!");
    if (players.find(p => p.name.toLowerCase() === inputName.trim().toLowerCase())) return alert("Nama sudah ada!");

    setPlayers([...players, { name: inputName.trim(), gender: inputGender }]);
    setInputName('');
    setInputGender('');
  };

  const removePlayer = (index) => {
    // FIX: Cegah penghapusan jika sedang di dalam game dan pemain sisa 2
    if (phase !== 'lobby' && players.length <= 2) {
      setShowMinPlayerAlert(true);
      return;
    }
    setPlayers(players.filter((_, i) => i !== index));
  };

  const startGame = () => {
    if (players.length < 2) return alert("Minimal 2 pemain bro!");
    nextTurn();
  };

  const hardResetGame = () => {
    setPlayers([]);
    setPhase('lobby');
    setCurrentPlayer(null);
    setActivePrompt('');
    setShowResetConfirm(false);
    localStorage.clear();
  };

  // --- ENGINE ALGORITMA ---
  const nextTurn = () => {
    if (players.length < 2) {
      alert("Pemain kurang dari 2! Silakan tambah pemain dulu.");
      setPhase('lobby');
      return;
    }
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    setCurrentPlayer(randomPlayer);
    setPhase('turn');
    playSound('select');
  };

  const generatePrompt = (type) => {
    playSound('reveal');
    const promptsArray = PROMPTS[type];
    let rawPrompt = promptsArray[Math.floor(Math.random() * promptsArray.length)];

    rawPrompt = rawPrompt.replace(/\[PLAYER\]/g, currentPlayer?.name || "Pemain");

    const otherPlayers = players.filter(p => p.name !== currentPlayer?.name);
    const randomBebas = otherPlayers.length > 0 ? otherPlayers[Math.floor(Math.random() * otherPlayers.length)].name : "orang di sebelahmu";
    rawPrompt = rawPrompt.replace(/\[TARGET_BEBAS\]/g, randomBebas);

    const lawanJenis = currentPlayer?.gender === 'L' ? 'P' : 'L';
    const targetLawanJenis = players.filter(p => p.gender === lawanJenis);
    const randomLawanJenis = targetLawanJenis.length > 0
      ? targetLawanJenis[Math.floor(Math.random() * targetLawanJenis.length)].name
      : "orang di sebelah kananmu";
    rawPrompt = rawPrompt.replace(/\[TARGET_LAWAN_JENIS\]/g, randomLawanJenis);

    setActivePrompt(rawPrompt);
    setPhase('result');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', marginTop: '10px' }}>

      {/* 1. POP-UP RESET GAME */}
      <ConfirmModal
        isOpen={showResetConfirm} title="⚠️ Reset Game?" message="Kembali ke lobby dan hapus semua pemain?"
        confirmText="Reset" cancelText="Batal"
        onConfirm={hardResetGame} onCancel={() => setShowResetConfirm(false)}
      />

      {/* 2. POP-UP ALERT MINIMAL PEMAIN (Tanya 'onCancel' agar jadi 1 tombol saja) */}
      <ConfirmModal
        isOpen={showMinPlayerAlert}
        title="⚠️ Gagal Menghapus"
        message="Game sedang berjalan dan butuh minimal 2 pemain. Tambahkan teman lain dulu jika ingin menghapus nama ini!"
        confirmText="Paham"
        confirmColor="#3b82f6"
        onConfirm={() => setShowMinPlayerAlert(false)}
      />

      {/* 3. POP-UP KELOLA PEMAIN */}
      {showManageModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '350px', border: '2px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} className="fade-in">
            <h3 style={{ margin: '0 0 15px 0', color: '#f8fafc', textAlign: 'center' }}>👥 Kelola Pemain</h3>

            <form onSubmit={addPlayer} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
              <input className="input-field" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Nama Pemain Baru..." style={{ marginBottom: 0, padding: '10px' }} />
              <div style={{ display: 'flex', gap: '5px' }}>
                <button type="button" onClick={() => setInputGender('L')} style={{ flex: 1, padding: '8px', background: inputGender === 'L' ? '#3b82f6' : '#0f172a', color: inputGender === 'L' ? 'white' : '#64748b', border: inputGender === 'L' ? '2px solid #60a5fa' : '1px solid #334155', borderRadius: '4px', fontWeight: 'bold' }}>👨 Laki {inputGender === 'L' && '✅'}</button>
                <button type="button" onClick={() => setInputGender('P')} style={{ flex: 1, padding: '8px', background: inputGender === 'P' ? '#ec4899' : '#0f172a', color: inputGender === 'P' ? 'white' : '#64748b', border: inputGender === 'P' ? '2px solid #f472b6' : '1px solid #334155', borderRadius: '4px', fontWeight: 'bold' }}>👩 Pr {inputGender === 'P' && '✅'}</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 15px' }}>+</button>
              </div>
            </form>

            <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', background: '#0f172a', borderRadius: '8px' }}>
              {players.map((p, i) => (
                <span key={i} style={{ background: p.gender === 'L' ? '#1d4ed8' : '#be185d', color: 'white', padding: '4px 10px', borderRadius: '15px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {p.gender === 'L' ? '👨' : '👩'} {p.name}
                  <b onClick={() => removePlayer(i)} style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</b>
                </span>
              ))}
            </div>

            <button onClick={() => setShowManageModal(false)} className="btn-danger" style={{ width: '100%', marginTop: '15px', padding: '10px', background: '#475569' }}>Tutup</button>
          </div>
        </div>
      )}

      {/* HEADER NAVIGASI DENGAN BUG ICON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div style={{ flex: 1 }}>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>← Kembali</Link>
        </div>

        {/* TENGAH: Icon Bug & Tooltip Pop-up */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <button onClick={() => setShowTooltip(!showTooltip)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0 }}>🐛</button>
          {showTooltip && (
            <div style={{ position: 'absolute', top: '35px', left: '50%', transform: 'translateX(-50%)', background: '#334155', color: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', width: '200px', textAlign: 'center', zIndex: 100, boxShadow: '0 4px 10px rgba(0,0,0,0.5)', border: '1px solid #475569' }}>
              Jika terdapat bug lakukan refresh halaman website!
            </div>
          )}
        </div>

        {/* KANAN: Menu Tambahan Jika Sedang Main */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
          {phase !== 'lobby' && (
            <>
              <button onClick={() => setShowManageModal(true)} style={{ background: 'none', border: 'none', fontSize: '14px', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>👥 Kelola</button>
              <button onClick={() => setShowResetConfirm(true)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0 }} title="Reset Game">🏠</button>
            </>
          )}
        </div>
      </div>

      <h2 style={{ textAlign: 'center', margin: 0 }}>🃏 Truth or Dare</h2>

      {/* ================= PHASE 1: LOBBY ================= */}
      {phase === 'lobby' && (
        <div className="fade-in">
          <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', border: '2px solid #334155' }}>
            <form onSubmit={addPlayer} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input className="input-field" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Nama Pemain..." style={{ marginBottom: 0 }} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setInputGender('L')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                    background: inputGender === 'L' ? '#3b82f6' : '#0f172a', color: inputGender === 'L' ? 'white' : '#64748b',
                    border: inputGender === 'L' ? '2px solid #60a5fa' : '2px solid #334155'
                  }}
                >
                  👨 Cowok {inputGender === 'L' && '✅'}
                </button>

                <button
                  type="button"
                  onClick={() => setInputGender('P')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                    background: inputGender === 'P' ? '#ec4899' : '#0f172a', color: inputGender === 'P' ? 'white' : '#64748b',
                    border: inputGender === 'P' ? '2px solid #f472b6' : '2px solid #334155'
                  }}
                >
                  👩 Cewek {inputGender === 'P' && '✅'}
                </button>
              </div>

              <button type="submit" className="btn-primary">Tambah Pemain</button>
            </form>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
            {players.map((p, i) => (
              <span key={i} style={{ background: p.gender === 'L' ? '#1d4ed8' : '#be185d', color: 'white', padding: '6px 12px', borderRadius: '15px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                {p.gender === 'L' ? '👨' : '👩'} {p.name}
                <b onClick={() => removePlayer(i)} style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</b>
              </span>
            ))}
            {players.length === 0 && <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', width: '100%' }}>Tambahkan teman-temanmu dulu!</p>}
          </div>

          {players.length >= 2 && (
            <button onClick={startGame} className="btn-action btn-danger" style={{ marginTop: '30px', padding: '15px', fontSize: '18px' }}>Mulai Game! 🔥</button>
          )}
        </div>
      )}

      {/* ================= PHASE 2: PILIH TRUTH ATAU DARE ================= */}
      {phase === 'turn' && (
        <div style={{ textAlign: 'center', marginTop: '30px' }} className="fade-in">
          <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '5px' }}>Kursi Panas Kali Ini:</p>
          <h1 style={{ color: currentPlayer?.gender === 'L' ? '#60a5fa' : '#f472b6', fontSize: '40px', textTransform: 'uppercase', margin: '0 0 40px 0', textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
            {currentPlayer?.name}
          </h1>

          <h2 style={{ color: '#f8fafc', marginBottom: '20px' }}>Tentukan Nasibmu!</h2>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div onClick={() => generatePrompt('truth')} style={{ flex: 1, background: '#3b82f6', color: 'white', padding: '40px 10px', borderRadius: '12px', fontSize: '24px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 0 #1d4ed8', transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform = 'translateY(5px)'}>
              TRUTH
            </div>
            <div onClick={() => generatePrompt('dare')} style={{ flex: 1, background: '#ef4444', color: 'white', padding: '40px 10px', borderRadius: '12px', fontSize: '24px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 0 #b91c1c', transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform = 'translateY(5px)'}>
              DARE
            </div>
          </div>
        </div>
      )}

      {/* ================= PHASE 3: RESULT (HASIL KARTU) ================= */}
      {phase === 'result' && (
        <div style={{ textAlign: 'center', marginTop: '20px' }} className="fade-in">
          <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '30px 20px', borderRadius: '15px', border: `3px solid #facc15`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ margin: 0, color: 'white', lineHeight: '1.5', fontSize: '22px' }}>
              {activePrompt}
            </h2>
          </div>

          <button onClick={nextTurn} className="btn-primary btn-action" style={{ marginTop: '30px', padding: '15px', fontSize: '18px' }}>
            Selesai, Lanjut Acak! 🎲
          </button>
        </div>
      )}

      <style>{`
        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.39, 0.575, 0.565, 1); }
        @keyframes fadeIn { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
