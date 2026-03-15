import { useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal'; // <-- IMPORT TEMPLATE POP-UP DI SINI

// --- GENERATOR SUARA REALISTIS ---
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    if (type === 'spin') {
      const duration = 15;
      const totalTicks = 80;

      for (let i = 0; i < totalTicks; i++) {
        const progress = i / totalTicks;
        const time = duration * (1 - Math.pow(1 - progress, 1/3));

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(120, now + time);

        gain.gain.setValueAtTime(0.15, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.015);

        osc.start(now + time);
        osc.stop(now + time + 0.02);
      }
    } else if (type === 'win') {
      const notes = [261.63, 329.63, 392.00];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'square';

        const startTime = now + (i * 0.12);
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.linearRampToValueAtTime(0, startTime + 0.2);

        osc.start(startTime); osc.stop(startTime + 0.2);
      });
      const oscLast = ctx.createOscillator();
      const gainLast = ctx.createGain();
      oscLast.connect(gainLast); gainLast.connect(ctx.destination);
      oscLast.type = 'square';
      oscLast.frequency.setValueAtTime(523.25, now + 0.4);
      gainLast.gain.setValueAtTime(0.2, now + 0.4);
      gainLast.gain.linearRampToValueAtTime(0, now + 2);
      oscLast.start(now + 0.4); oscLast.stop(now + 2);
    }
  } catch(e) { console.error("Audio error", e); }
};

const SLICE_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#a855f7', '#f97316', '#ec4899', '#14b8a6'];

export default function Roulette() {
  const [players, setPlayers] = useState([]);
  const [inputName, setInputName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  const [rotation, setRotation] = useState(0);
  const [winnerName, setWinnerName] = useState(null);

  const [showTooltip, setShowTooltip] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // --- SETTINGAN CURANG ---
  const targetNames = ['syarif', 'kolep', 'lep', 'maulana', 'malik', 'ibrahim'];
  const cheatProbability = 1.0;

  const addPlayer = (e) => {
    e.preventDefault();
    if (inputName.trim() !== '') {
      if (players.includes(inputName.trim())) return alert("Nama ini sudah ada!"); // Nanti alert ini juga bisa kita ubah pakai Modal kalau mau!
      setPlayers([...players, inputName.trim()]);
      setInputName('');
      setWinnerName(null);
    }
  };

  const removePlayer = (index) => {
    if (isSpinning) return;
    setPlayers(players.filter((_, i) => i !== index));
    setWinnerName(null);
  };

  // --- FUNGSI RESET KUSTOM ---
  const handleResetClick = () => {
    if (isSpinning || players.length === 0) return;
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setPlayers([]);
    setWinnerName(null);
    setRotation(0);
    setShowResetConfirm(false);
  };

  const spin = () => {
    if (players.length < 2) return alert("Minimal 2 orang bro!");
    setIsSpinning(true);
    setWinnerName(null);
    playSound('spin');

    let finalWinner = '';
    let winnerIndex = 0;

    const riggedPlayer = players.find(p => targetNames.includes(p.toLowerCase()));

    if (riggedPlayer && Math.random() <= cheatProbability) {
      finalWinner = riggedPlayer;
      winnerIndex = players.indexOf(riggedPlayer);
    } else {
      winnerIndex = Math.floor(Math.random() * players.length);
      finalWinner = players[winnerIndex];
    }

    const sliceAngle = 360 / players.length;
    const winnerCenterAngle = (winnerIndex * sliceAngle) + (sliceAngle / 2);

    const baseSpins = 360 * 10;
    const randomOffset = (Math.random() * (sliceAngle * 0.7)) - (sliceAngle * 0.35);

    const currentRemainder = rotation % 360;
    const newTarget = rotation - currentRemainder + baseSpins + (360 - winnerCenterAngle) + randomOffset;

    setRotation(newTarget);

    setTimeout(() => {
      setIsSpinning(false);
      setWinnerName(finalWinner);
      playSound('win');
    }, 15000);
  };

  const getConicGradient = () => {
    if (players.length === 0) return '#334155';
    if (players.length === 1) return SLICE_COLORS[0];
    const angle = 360 / players.length;
    let gradient = '';
    players.forEach((_, i) => { gradient += `${SLICE_COLORS[i % SLICE_COLORS.length]} ${i * angle}deg ${(i + 1) * angle}deg, `; });
    return `conic-gradient(${gradient.slice(0, -2)})`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>

      {/* MENGGUNAKAN TEMPLATE MODAL POP-UP DI SINI */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="⚠️ Hapus Semua?"
        message="Semua nama yang sudah ditambahkan akan dihapus dari roda."
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      <style>{`
        @keyframes winnerPopUp {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
          60% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 15px #facc15, inset 0 0 10px #facc15; }
          50% { box-shadow: 0 0 30px #facc15, inset 0 0 20px #facc15; }
          100% { box-shadow: 0 0 15px #facc15, inset 0 0 10px #facc15; }
        }
      `}</style>

      <h2 style={{ textAlign: 'center', margin: 0 }}>🎯 Spinner Wheels</h2>

      <form onSubmit={addPlayer} style={{ display: 'flex', gap: '8px' }}>
        <input className="input-field" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Ketik nama teman..." disabled={isSpinning} style={{ marginBottom: 0 }} />
        <button type="submit" className="btn-primary" disabled={isSpinning}>+</button>
        <button type="button" onClick={handleResetClick} className="btn-danger" disabled={isSpinning || players.length === 0} style={{ padding: '12px', background: '#475569' }} title="Hapus semua nama">
          🔄
        </button>
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: '#1e293b', padding: '10px', borderRadius: '8px', border: '2px solid #334155', minHeight: '50px' }}>
        {players.map((p, i) => (
          <span key={i} style={{ background: SLICE_COLORS[i % SLICE_COLORS.length], color: 'white', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
            {p} {!isSpinning && <b onClick={() => removePlayer(i)} style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</b>}
          </span>
        ))}
        {players.length === 0 && <p style={{ fontSize: '12px', color: '#64748b', margin: 'auto' }}>Belum ada pemain.</p>}
      </div>

      {/* RODA BERPUTAR */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: '35px solid white', zIndex: 10, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))' }}></div>
        <div style={{ width: '280px', height: '280px', borderRadius: '50%', background: getConicGradient(), transform: `rotate(${rotation}deg)`, transition: 'transform 15s cubic-bezier(0.1, 0.9, 0.2, 1)', position: 'relative', overflow: 'hidden', boxShadow: '0 0 25px rgba(0,0,0,0.6)', border: '5px solid #f8fafc' }}>
          {players.length > 1 && players.map((p, i) => {
            const angle = (i * (360 / players.length)) + ((360 / players.length) / 2);
            return (
              <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-95px)`, color: 'white', fontWeight: '900', fontSize: players.length > 8 ? '11px' : '15px', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                {p.substring(0, 10)}{p.length > 10 ? '...' : ''}
              </div>
            )
          })}
        </div>

        {/* ANIMASI KARTU PEMENANG */}
        {winnerName && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '15px 20px', borderRadius: '15px', border: '3px solid #facc15', animation: 'winnerPopUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, glowPulse 2s infinite', textAlign: 'center', zIndex: 20, width: '240px' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#94a3b8' }}>Terpilih:</p>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#facc15', textTransform: 'uppercase', letterSpacing: '1px', wordWrap: 'break-word' }}>
              {winnerName}
            </h1>
          </div>
        )}
      </div>

      <button onClick={spin} disabled={isSpinning || players.length < 2} className="btn-action btn-danger" style={{ fontSize: '20px', letterSpacing: '2px', padding: '18px', background: isSpinning ? '#64748b' : '#ef4444' }}>
        {isSpinning ? 'MEMUTAR...' : 'PUTAR!'}
      </button>

    </div>
  );
}
