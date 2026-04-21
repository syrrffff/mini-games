import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

// --- DATABASE PERTANYAAN (DEEP TALK, OPINI, CHILL) ---
const QUESTIONS = [
  "Kalo waktu bisa diulang ke 5 tahun yang lalu, apa satu hal yang pengen lu ubah?",
  "Apa 'Unpopular Opinion' lu yang sering bikin orang lain nggak setuju?",
  "Menurut lu, selingkuh itu murni niat atau karena ada kesempatan?",
  "Apa first impression (kesan pertama) lu ke orang-orang yang ada di ruangan ini?",
  "Pernah nggak lu ngerasa salah jalan/salah milih keputusan besar di hidup lu? Ceritain dong.",
  "Kalo lu tiba-tiba dikasih uang 10 Miliar hari ini, apa 3 hal pertama yang bakal lu lakuin?",
  "Apa ketakutan terbesar lu soal masa depan?",
  "Gimana definisi 'Sukses' versi lu sendiri, bukan versi orang lain?",
  "Pernah ngerasa kesepian banget padahal lagi di tengah keramaian? Kenapa bisa gitu?",
  "Apa satu hal yang lu harap orang tua lu ngerti tentang diri lu, tapi susah buat diomongin?",
  "Ceritain momen titik terendah (lowest point) di hidup lu, dan gimana cara lu bangkit?",
  "Kalo lu sisa hidup tinggal 1 bulan lagi, apa yang bakal lu lakuin?",
  "Menurut lu, mending pacaran sama orang yang lu sayang banget, atau orang yang sayang banget sama lu?",
  "Apa ekspektasi terbesar lu di umur 30 tahun nanti?",
  "Hal paling gila atau nekat apa yang pengen banget lu coba minimal sekali seumur hidup?",
  "Menurut lu, cowok sama cewek bisa murni sahabatan tanpa ada yang baper nggak? Kasih alasannya.",
  "Kalo lu bisa denger isi pikiran satu orang di ruangan ini, lu pengen denger pikirannya siapa?",
  "Apa sifat buruk lu yang lu sadar itu jelek, tapi susah banget buat dirubah?",
  "Pernah pura-pura bahagia padahal lagi hancur banget? Momen pas lagi ngapain?",
  "Sebutin satu lagu yang liriknya ngena banget dan nge-gambarin kisah hidup lu banget!",
  "Dari semua temen yang lu punya, lu ngerasa paling bisa jadi 'diri sendiri' pas lagi sama siapa?",
  "Apa pujian paling berkesan yang pernah lu dapet dari orang lain?",
  "Menurut lu, apa tanda-tanda paling kelihatan kalau seseorang itu 'Red Flag'?",
  "Kalau lu bisa minta maaf ke satu orang dari masa lalu lu, lu mau minta maaf ke siapa dan kenapa?",
  "Apa hal kecil yang sering disepelein orang, tapi bisa bikin lu seneng banget?",
  "Lebih pilih punya karir cemerlang tapi jomblo seumur hidup, atau karir biasa aja tapi punya keluarga harmonis?",
  "Apa kebohongan yang paling sering lu katain ke diri lu sendiri?",
  "Menurut lu, cinta sejati itu emang ada atau cuma mitos yang diover-romantisasi?",
  "Kalau hidup lu dijadiin film, kira-kira genre apa dan judulnya apa?",
  "Apa satu hal yang lu pelajarin dari patah hati lu yang paling parah?",
  "Pernah nggak lu ngejauh dari temen lu sendiri? Apa alasannya?",
  "Menurut lu, uang beneran bisa beli kebahagiaan nggak?",
  "Kalo ada mesin waktu, lu lebih milih pergi ke masa lalu atau ngintip masa depan?",
  "Apa momen paling berkesan yang pernah lu laluin bareng orang-orang di ruangan ini?",
  "Siapa orang yang paling lu jadiin role model atau panutan di hidup lu?",
  "Pernah merasa dikhianatin sama orang yang paling lu percaya? Gimana lu ngatasinnya?",
  "Apa satu kebiasaan toxic yang mau lu tinggalin di tahun ini?",
  "Kalau lu cuma boleh makan 1 jenis makanan seumur hidup, lu bakal pilih makanan apa?",
  "Menurut lu, lebih sakit ditinggalin pas lagi sayang-sayangnya, atau ditolak pas lagi PDKT?",
  "Apa kebiasaan lu yang susah lu ubah dari dulu?",
  "Apa hal yang paling lu syukurin terjadi di hidup lu sampai hari ini?"
];

// --- GENERATOR SUARA ---
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    if (type === 'shuffle') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(400, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'reveal') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now); osc.stop(now + 0.5);
    }
  } catch(e) { console.error("Audio error", e); }
};

export default function TalkNChill() {
  const [currentCard, setCurrentCard] = useState(() => localStorage.getItem('tnc_currentCard') || null);
  const [usedQuestions, setUsedQuestions] = useState(() => JSON.parse(localStorage.getItem('tnc_usedQuestions')) || []);
  const [isShuffling, setIsShuffling] = useState(false);

  // STATE BARU UNTUK ALERT MODAL
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '' });

  // Simpan state ke LocalStorage
  useEffect(() => {
    if (currentCard) localStorage.setItem('tnc_currentCard', currentCard);
    localStorage.setItem('tnc_usedQuestions', JSON.stringify(usedQuestions));
  }, [currentCard, usedQuestions]);

  const drawCard = () => {
    if (isShuffling) return;

    playSound('shuffle');
    setIsShuffling(true);

    setTimeout(() => {
      let availableQuestions = QUESTIONS.filter(q => !usedQuestions.includes(q));

      // Jika pertanyaan habis, panggil Modal lalu reset
      if (availableQuestions.length === 0) {
        setAlertData({
          isOpen: true,
          title: "🔄 Topik Habis!",
          message: "Wow! Kalian udah bahas semua topik malam ini. Tumpukan kartu akan otomatis dikocok ulang dari awal ya!"
        });
        availableQuestions = [...QUESTIONS];
        setUsedQuestions([]);
      }

      const randomQ = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

      setCurrentCard(randomQ);
      setUsedQuestions(prev => [...prev, randomQ]);
      setIsShuffling(false);
      playSound('reveal');

    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', marginTop: '10px' }}>

      {/* MODAL PERINGATAN KARTU HABIS */}
      <ConfirmModal
        isOpen={alertData.isOpen}
        title={alertData.title}
        message={alertData.message}
        confirmText="Lanjut Gas!"
        confirmColor="#a855f7" // Menggunakan warna ungu tema Talk n Chill
        onConfirm={() => setAlertData({ ...alertData, isOpen: false })}
      />

      {/* INJECT CSS ANIMASI 3D KARTU */}
      <style>{`
        .card-container {
          perspective: 1000px;
          width: 100%;
          max-width: 320px;
          height: 400px;
          margin: 30px auto;
        }
        .card-inner {
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          position: relative;
        }
        .card-inner.flipped {
          transform: rotateY(180deg);
        }
        .card-inner.shuffling {
          animation: shake 0.4s infinite;
        }
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.5);
          border: 4px solid #334155;
        }
        .card-front {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          color: #f8fafc;
          flex-direction: column;
          text-align: center;
        }
        .card-back {
          background: linear-gradient(135deg, #a855f7, #6b21a8);
          color: white;
          transform: rotateY(180deg);
          border-color: #d8b4fe;
        }
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          20% { transform: translate(-3px, 0px) rotate(-5deg); }
          40% { transform: translate(1px, -1px) rotate(5deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          80% { transform: translate(1px, -1px) rotate(5deg); }
          100% { transform: translate(1px, 1px) rotate(0deg); }
        }
      `}</style>

      {/* HEADER NAVIGASI */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: '10px' }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>← Kembali</Link>
      </div>

      <h2 style={{ margin: 0, fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        💬 Talk n Chill
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '13px', margin: '5px 0 0 0' }}>Bahas santai, buka pikiran, tanpa judge.</p>

      {/* AREA KARTU */}
      <div className="card-container">
        <div className={`card-inner ${currentCard && !isShuffling ? 'flipped' : ''} ${isShuffling ? 'shuffling' : ''}`}>

          {/* BAGIAN BELAKANG KARTU (Saat Belum Dibuka / Sedang Dikocok) */}
          <div className="card-face card-front">
            <span style={{ fontSize: '60px', marginBottom: '10px' }}>🃏</span>
            <h3 style={{ margin: 0, color: '#a855f7', letterSpacing: '2px' }}>T&C CARD</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>Tarik kartu untuk memulai deep talk</p>
          </div>

          {/* BAGIAN DEPAN KARTU (Isi Pertanyaan) */}
          <div className="card-face card-back">
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '30px', display: 'block', marginBottom: '20px' }}>✨</span>
              <h2 style={{ fontSize: '22px', lineHeight: '1.5', margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                "{currentCard}"
              </h2>
            </div>
          </div>

        </div>
      </div>

      {/* TOMBOL TARIK KARTU */}
      <button
        onClick={drawCard}
        disabled={isShuffling}
        style={{
          width: '100%', maxWidth: '320px', padding: '18px',
          background: isShuffling ? '#475569' : '#a855f7',
          color: 'white', border: 'none', borderRadius: '8px',
          fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
          boxShadow: '0 4px 0 #7e22ce', transition: 'transform 0.1s',
          marginTop: '20px'
        }}
        onMouseDown={e => { if(!isShuffling) e.currentTarget.style.transform = 'translateY(4px)'; }}
        onMouseUp={e => { if(!isShuffling) e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {isShuffling ? 'MENGOCOK KARTU...' : (currentCard ? 'Tarik Pertanyaan Lain 🔄' : 'Tarik Kartu Sekarang!')}
      </button>

      <p style={{ marginTop: '20px', fontSize: '11px', color: '#64748b' }}>
        Kartu dimainkan: {usedQuestions.length} / {QUESTIONS.length}
      </p>

    </div>
  );
}
