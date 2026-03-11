import { useState } from 'react';

export default function Roulette() {
  const [players, setPlayers] = useState([]);
  const [inputName, setInputName] = useState('');
  const [displayRole, setDisplayRole] = useState('Siapa tumbalnya?');
  const [isSpinning, setIsSpinning] = useState(false);

  // Settingan curang
  const targetNames = ['syarif', 'kolep','lep', 'maulana','malik','ibrahim'];
  const cheatProbability = 1.0;

  const addPlayer = (e) => {
    e.preventDefault();
    if (inputName.trim() !== '') {
      setPlayers([...players, inputName.trim()]);
      setInputName('');
    }
  };

  const removePlayer = (index) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const spin = () => {
    if (players.length < 2) return alert("Minimal 2 orang bro!");
    setIsSpinning(true);

    let finalWinner = '';
    const riggedPlayer = players.find(p => targetNames.includes(p.toLowerCase()));

    if (riggedPlayer && Math.random() <= cheatProbability) {
      finalWinner = riggedPlayer;
    } else {
      finalWinner = players[Math.floor(Math.random() * players.length)];
    }

    let count = 0;
    const interval = setInterval(() => {
      const randomName = players[Math.floor(Math.random() * players.length)];
      setDisplayRole(randomName);
      count++;

      if (count > 30) {
        clearInterval(interval);
        setDisplayRole(`🎉 ${finalWinner} 🎉`);
        setIsSpinning(false);
      }
    }, 80);
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Roulette</h2>

      <form onSubmit={addPlayer} style={{ display: 'flex', gap: '10px' }}>
        <input
          className="input-field"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Ketik nama teman..."
        />
        <button type="submit" className="btn-primary" style={{ height: '48px' }}>+</button>
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '15px 0' }}>
        {players.map((p, i) => (
          <span key={i} style={{ background: '#334155', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {p}
            <b onClick={() => removePlayer(i)} style={{ color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>&times;</b>
          </span>
        ))}
        {players.length === 0 && <p style={{ fontSize: '12px', color: '#64748b' }}>Belum ada pemain. Tambahkan di atas.</p>}
      </div>

      <div style={{
        height: '120px', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', fontWeight: '800', borderRadius: '8px',
        backgroundColor: isSpinning ? '#3b82f6' : '#0f172a',
        color: isSpinning ? 'white' : '#f8fafc',
        border: '2px solid #334155',
        transition: 'background-color 0.3s',
        marginTop: '30px', textAlign: 'center', padding: '10px'
      }}>
        {displayRole}
      </div>

      <button onClick={spin} disabled={isSpinning} className="btn-action btn-danger">
        {isSpinning ? 'MEMUTAR...' : 'GAS PUTAR!'}
      </button>
    </div>
  );
}
