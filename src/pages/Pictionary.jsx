import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { ref, update, onValue, get, remove, push, onDisconnect } from 'firebase/database';
import ConfirmModal from '../components/ConfirmModal'; // <-- IMPORT MODAL

// --- DATABASE TEBAK GAMBAR (100+ KATA SUPER ABSURD & RANDOM) ---
const WORD_LIST = [
  // Level Pemanasan
  "Kucing", "Sepeda", "Rumah", "Pohon", "Mobil", "Gunung", "Gitar", "Laptop", "Pesawat", "Buku",
  "Kacamata", "Sepatu", "Jam Tangan", "Kopi", "Kipas Angin", "Dispenser", "Kulkas", "Mesin Cuci",
  "Rice Cooker", "Setrika", "Jemuran", "Sapu Lidi", "Pengki", "Ember", "Gayung", "Sikat Gigi",
  "Sampo Sachet", "Gunting Kuku", "Cotton Bud", "Karet Gelang", "Peniti", "Televisi Tabung",
  "Kalkulator", "Gembok", "Obeng", "Palu", "Gergaji", "Kawat Gigi", "Gigi Palsu", "Rambut Palsu",
  // Level Tongkrongan & Jalanan
  "Polisi Tidur", "Lampu Merah", "Tiang Listrik", "Angkot", "Becak", "Gerobak Bakso", "Pintu Tol",
  "Zebra Cross", "Tukang Parkir", "Helm Bogo", "Knalpot Racing", "Spion", "Tilang Polisi", "CCTV",
  "Jas Hujan Kelelawar", "Warnet", "Warkop", "Sinyal Lemah", "Centang Biru", "Colokan Listrik",
  "Powerbank", "Headset Kusut",
  // Level Makanan
  "Es Teh Plastik", "Nasi Bungkus Karet Dua", "Seblak Ceker", "Martabak Telur", "Tahu Bulat",
  "Gorengan", "Kerupuk Putih", "Sate Ayam", "Es Campur", "Pete", "Jengkol", "Durian",
  "Kopi Hitam", "Mendoan", "Mie Ayam", "Bakso Beranak",
  // Level Hewan & Alam
  "Kecoak Terbang", "Nyamuk Kawin", "Lalat", "Cicak Putus Ekor", "Tokek", "Ulat Bulu", "Kelabang",
  "Buaya Darat", "Gurita", "Kaktus", "Bunga Bangkai", "Pohon Beringin", "Awan Mendung", "Petir",
  "Pelangi", "Bulu Babi", "Lintah", "Tikus Got", "Burung Hantu", "Kucing Oyen",
  // Level Abstrak / Situasi Lucu
  "Dompet Kosong", "Sakit Gigi", "Kesemutan", "Kentut", "Masuk Angin", "Tanggal Tua", "Cicilan",
  "Bau Badan", "Kutu Rambut", "Panu", "Ketombe", "Kurang Tidur", "Ngantuk Berat", "Patah Hati",
  "Mimpi Buruk", "Kebelet Boker", "Lupa Password", "Mabuk Laut", "Kesandung Batu", "Gaji Numpang Lewat",
  // Level Mistis / Fantasi
  "Pocong", "Tuyul", "Kuntilanak", "Alien", "UFO", "Ninja", "Zombie", "Bajak Laut", "Putri Duyung", "Malaikat"
];

const PALETTE = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#facc15'];

// --- DATABASE MELODI BACKGROUND MUSIC ---
const BGM_MELODIES = [
  [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 329.63], // Upbeat
  [261.63, null, 392.00, null, 329.63, null, 392.00, null],         // Chill
  [220.00, 261.63, 329.63, 440.00, 392.00, 329.63, 261.63, 293.66]  // Mikir
];

// --- GENERATOR SUARA EFFECT (DENGAN KONTROL VOLUME) ---
const playSound = (type, volMultiplier = 1) => {
  if (volMultiplier <= 0) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'beep') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.2 * volMultiplier, now); osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'start') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.4 * volMultiplier, now); osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'correct') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
      gain.gain.setValueAtTime(0.3 * volMultiplier, now); gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.3 * volMultiplier, now); gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'gameover') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(523.25, now + 0.1); osc.frequency.setValueAtTime(659.25, now + 0.2);
      gain.gain.setValueAtTime(0.3 * volMultiplier, now); gain.gain.linearRampToValueAtTime(0, now + 0.8);
      osc.start(now); osc.stop(now + 0.8);
    }
  } catch(e) { console.error("Audio error", e); }
};

// --- FUNGSI GENERATOR NADA BGM (DENGAN KONTROL VOLUME) ---
const playBGMNote = (ctx, freq, volMultiplier = 1) => {
  if (!freq || volMultiplier <= 0) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.value = freq;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);

    // Base volume dinaikkan jadi 0.08 (awalnya 0.015) agar kedengaran di HP
    gain.gain.linearRampToValueAtTime(0.08 * volMultiplier, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch(e) { console.error("BGM Audio error", e); }
};

const getRandomWords = (count = 3) => {
  const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function Pictionary() {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [roomData, setRoomData] = useState(null);

  const [guessInput, setGuessInput] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [roleAnim, setRoleAnim] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [activeColor, setActiveColor] = useState('#000000');

  const [showTooltip, setShowTooltip] = useState(false);

  // STATE MODAL ALERT (PENGGANTI ALERT BAWAAN)
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '' });
  const showAlert = (title, message) => setAlertData({ isOpen: true, title, message });

  // --- STATE VOLUME BGM & EFFECT ---
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('pict_volume');
    return saved !== null ? parseFloat(saved) : 0.8; // Default 80%
  });
  const volumeRef = useRef(volume); // Ref untuk dibaca oleh setInterval BGM

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const colorRef = useRef('#000000');
  const chatContainerRef = useRef(null);
  const bgmRef = useRef({ interval: null, ctx: null, step: 0, melodyIndex: 0 });

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    volumeRef.current = val;
    localStorage.setItem('pict_volume', val);
  };

  useEffect(() => {
    const savedRoom = localStorage.getItem('roomCode');
    const savedName = localStorage.getItem('playerName');
    if (savedRoom && savedName) { setRoomCode(savedRoom); setPlayerName(savedName); connectToRoom(savedRoom, savedName); }
  }, []);

  const connectToRoom = (code, name) => {
    const roomRef = ref(db, `rooms/${code}`);
    const playerRef = ref(db, `rooms/${code}/players/${name}`);
    onDisconnect(playerRef).remove();

    get(playerRef).then((snap) => { if (!snap.exists()) update(playerRef, { score: 0, isReady: false }); });

    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
        if (data.gameState?.canvasData && canvasRef.current && data.gameState.currentDrawer !== name) {
          const image = new Image();
          image.src = data.gameState.canvasData;
          image.onload = () => {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, 400, 300); ctx.drawImage(image, 0, 0);
          };
        } else if (data.gameState?.canvasData === "" && canvasRef.current) {
           canvasRef.current.getContext('2d').clearRect(0, 0, 400, 300);
        }
      }
    });
    setIsJoined(true);
  };

  const joinRoom = () => {
    if (!roomCode || !playerName) return showAlert("⚠️ Oops!", "Jangan lupa isi Nama dan Kode Room kamu dulu bro!");
    localStorage.setItem('roomCode', roomCode); localStorage.setItem('playerName', playerName);
    connectToRoom(roomCode, playerName);
    playSound('beep', volumeRef.current);
  };

  const exitRoom = async () => {
    const playersRef = ref(db, `rooms/${roomCode}/players`);
    const snap = await get(playersRef);
    if (snap.exists() && Object.keys(snap.val()).length <= 1) remove(ref(db, `rooms/${roomCode}`));
    else remove(ref(db, `rooms/${roomCode}/players/${playerName}`));
    localStorage.clear(); setIsJoined(false); setRoomData(null);
  };

  // --- SISTEM BACKGROUND MUSIC (BGM) MEMAKAI VOLUME REF ---
  useEffect(() => {
    if (isJoined && volumeRef.current > 0) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!bgmRef.current.ctx) bgmRef.current.ctx = new AudioContext();
      const ctx = bgmRef.current.ctx;
      if (ctx.state === 'suspended') ctx.resume();

      if (!bgmRef.current.interval) {
        bgmRef.current.melodyIndex = Math.floor(Math.random() * BGM_MELODIES.length);
        bgmRef.current.interval = setInterval(() => {
          const seq = BGM_MELODIES[bgmRef.current.melodyIndex];
          const freq = seq[bgmRef.current.step % seq.length];
          // Mainkan dengan volume slider saat ini
          playBGMNote(ctx, freq, volumeRef.current);
          bgmRef.current.step++;
        }, 300);
      }
    } else {
      clearInterval(bgmRef.current.interval);
      bgmRef.current.interval = null;
    }

    return () => {
      clearInterval(bgmRef.current.interval);
      bgmRef.current.interval = null;
    };
  }, [isJoined, volume]); // Update dipicu oleh perubahan volume atau saat join

  const toggleReady = () => update(ref(db, `rooms/${roomCode}/players/${playerName}`), { isReady: !(roomData?.players[playerName]?.isReady) });

  const playersList = roomData?.players ? Object.keys(roomData.players) : [];
  const allReady = playersList.length > 1 && playersList.every(p => roomData.players[p].isReady);

  const turnOrder = roomData?.gameState?.turnOrder || [];
  const currentDrawerName = turnOrder[roomData?.gameState?.currentDrawerIndex || 0];
  const isMyTurn = currentDrawerName === playerName;
  const isPlaying = roomData?.gameState?.status === "playing";
  const correctGuessers = roomData?.gameState?.correctGuessers || [];
  const hasGuessed = correctGuessers.includes(playerName);
  const isSpectator = (roomData?.gameState?.status === "playing" || roomData?.gameState?.status === "starting" || roomData?.gameState?.status === "choosing_word") && !turnOrder.includes(playerName);

  const startGameSequence = () => {
    const activePlayers = Object.keys(roomData.players);
    update(ref(db, `rooms/${roomCode}/gameState`), {
      status: "choosing_word",
      currentDrawerIndex: 0,
      turnOrder: activePlayers,
      wordChoices: getRandomWords(3),
      currentWord: "",
      canvasData: "",
      correctGuessers: []
    });
    activePlayers.forEach(p => update(ref(db, `rooms/${roomCode}/players/${p}`), { isReady: false }));
  };

  useEffect(() => {
    if ((roomData?.gameState?.status === "waiting" || !roomData?.gameState?.status) && allReady) {
      if (playersList[0] === playerName) startGameSequence();
    }
  }, [allReady, roomData?.gameState?.status]);

  const nextTurn = () => {
    const nextIndex = roomData.gameState.currentDrawerIndex + 1;
    if (nextIndex >= turnOrder.length) {
      update(ref(db, `rooms/${roomCode}/gameState`), { status: "gameOver" });
    } else {
      update(ref(db, `rooms/${roomCode}/gameState`), {
        status: "choosing_word",
        currentDrawerIndex: nextIndex,
        wordChoices: getRandomWords(3),
        currentWord: "",
        canvasData: "",
        correctGuessers: []
      });
    }
  };

  const handleWordSelect = (selectedWord) => {
    update(ref(db, `rooms/${roomCode}/gameState`), {
      status: "starting",
      currentWord: selectedWord,
      wordChoices: null
    });
  };

  useEffect(() => {
    if (roomData?.gameState?.status === 'starting') {
      let count = 3; setCountdown(count); playSound('beep', volumeRef.current);
      const interval = setInterval(() => {
        count--;
        if (count > 0) { setCountdown(count); playSound('beep', volumeRef.current); }
        else if (count === 0) { setCountdown("MULAI!"); playSound('start', volumeRef.current); }
        else {
          clearInterval(interval); setCountdown(null);
          if (isMyTurn) update(ref(db, `rooms/${roomCode}/gameState`), { status: 'playing', turnEndTime: Date.now() + 90000 });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [roomData?.gameState?.status, isMyTurn, roomCode]);

  useEffect(() => {
    if (roomData?.gameState?.status === 'playing') {
      setRoleAnim(true);
      const timer = setTimeout(() => setRoleAnim(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setRoleAnim(false);
    }
  }, [roomData?.gameState?.status]);

  useEffect(() => {
    if (roomData?.gameState?.status === 'playing') {
      const interval = setInterval(() => {
        const remaining = Math.floor((roomData.gameState.turnEndTime - Date.now()) / 1000);
        if (remaining <= 0) {
          clearInterval(interval);
          if (isMyTurn) {
             const currentScore = roomData.players[playerName].score || 0;
             if (correctGuessers.length === 0) update(ref(db, `rooms/${roomCode}/players/${playerName}`), { score: currentScore + 10 });
             update(ref(db, `rooms/${roomCode}/gameState`), { status: 'roundEnd', endReason: 'timeup' });
          }
        } else { setTimeLeft(remaining); }
      }, 1000);
      return () => clearInterval(interval);
    } else if (roomData?.gameState?.status === 'starting' || roomData?.gameState?.status === 'waiting' || roomData?.gameState?.status === 'choosing_word') {
        setTimeLeft(90);
    }
  }, [roomData?.gameState?.status, roomData?.gameState?.turnEndTime, isMyTurn, correctGuessers.length]);

  useEffect(() => {
    if (roomData?.gameState?.status === 'roundEnd') {
      roomData.gameState.endReason === 'timeup' ? playSound('wrong', volumeRef.current) : playSound('correct', volumeRef.current);
      const timer = setTimeout(() => { if (isMyTurn) nextTurn(); }, 4000);
      return () => clearTimeout(timer);
    }
  }, [roomData?.gameState?.status]);

  useEffect(() => {
    if (roomData?.gameState?.status === 'gameOver') {
      playSound('gameover', volumeRef.current);
      const timer = setTimeout(() => {
        if (isMyTurn) {
          update(ref(db, `rooms/${roomCode}/gameState`), { status: "waiting" });
          Object.keys(roomData.players).forEach(p => update(ref(db, `rooms/${roomCode}/players/${p}`), { isReady: false }));
        }
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [roomData?.gameState?.status]);

  const chatMsgCount = roomData?.chat ? Object.keys(roomData.chat).length : 0;
  useEffect(() => { if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, [chatMsgCount]);

  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e) => {
    if (!isMyTurn || !isPlaying || isSpectator) return;
    isDrawingRef.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.strokeStyle = colorRef.current; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  };
  const draw = (e) => {
    if (!isDrawingRef.current || !isMyTurn || !isPlaying || isSpectator) return;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y); ctx.stroke();
  };
  const stopDrawing = () => {
    if (!isDrawingRef.current || !isMyTurn || !isPlaying || isSpectator) return;
    isDrawingRef.current = false;
    update(ref(db, `rooms/${roomCode}/gameState`), { canvasData: canvasRef.current.toDataURL() });
  };

  const submitGuess = (e) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    if (!isPlaying || isSpectator || isMyTurn) {
      push(ref(db, `rooms/${roomCode}/chat`), { sender: playerName, text: guessInput, isCorrect: false });
    } else {
      const currentWord = roomData?.gameState?.currentWord;
      if (guessInput.toLowerCase() === currentWord.toLowerCase()) {
        if (hasGuessed) return setGuessInput('');
        playSound('correct', volumeRef.current);

        const points = Math.max(2, 10 - (correctGuessers.length * 2));
        const newCorrectGuessers = [...correctGuessers, playerName];

        update(ref(db, `rooms/${roomCode}/players/${playerName}`), { score: (roomData.players[playerName].score || 0) + points });
        update(ref(db, `rooms/${roomCode}/gameState`), { correctGuessers: newCorrectGuessers });
        push(ref(db, `rooms/${roomCode}/chat`), { sender: "Sistem", text: `${playerName} MENEBAK BENAR! (+${points} Pts)`, isCorrect: true });

        if (newCorrectGuessers.length >= (turnOrder.length - 1)) {
          update(ref(db, `rooms/${roomCode}/gameState`), { status: 'roundEnd', endReason: 'all_guessed' });
        }
      } else {
        push(ref(db, `rooms/${roomCode}/chat`), { sender: playerName, text: guessInput, isCorrect: false });
      }
    }
    setGuessInput('');
  };

  const getTopPlayers = () => {
    if (!roomData?.players) return [];
    return Object.entries(roomData.players).map(([name, data]) => ({ name, score: data.score || 0 })).sort((a, b) => b.score - a.score).slice(0, 3);
  };

  // --- RENDER SCREEN BELUM MASUK ROOM ---
  if (!isJoined) {
    return (
      <div>
        <ConfirmModal
          isOpen={alertData.isOpen}
          title={alertData.title}
          message={alertData.message}
          confirmText="Oke Paham!"
          confirmColor="#3b82f6"
          onConfirm={() => setAlertData({ ...alertData, isOpen: false })}
        />

        <Link to="/" style={{ display: 'inline-block', color: '#94a3b8', textDecoration: 'none', marginTop: '10px', fontSize: '14px', fontWeight: 'bold' }}>
          ← Kembali
        </Link>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>🎨 Tebak Gambar</h2>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
          <input className="input-field" placeholder="Nama Kamu" value={playerName} onChange={e => setPlayerName(e.target.value)} />
          <input className="input-field" placeholder="Kode Room Bebas" value={roomCode} onChange={e => setRoomCode(e.target.value)} />
          <button onClick={joinRoom} className="btn-primary btn-action">Masuk Room</button>
        </div>
      </div>
    );
  }

  const isReady = roomData?.players[playerName]?.isReady;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px' , marginTop: '10px'}}>

      {/* HEADER NAVIGASI & INFO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Room: <span style={{ color: '#3b82f6' }}>{roomCode}</span></h3>
        </div>

        {/* TENGAH: Slider BGM & Bug Icon */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '10px', position: 'relative' }}>

          {/* SLIDER VOLUME MUSIK BARU */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '15px' }}>
            <span style={{fontSize: '14px'}}>{volume === 0 ? '🔇' : '🎵'}</span>
            <input
              type="range"
              min="0" max="1" step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              style={{ width: '50px', accentColor: '#3b82f6' }}
            />
          </div>

          <button onClick={() => setShowTooltip(!showTooltip)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0 }}>❓</button>
          {showTooltip && (
            <div style={{ position: 'absolute', top: '35px', left: '50%', transform: 'translateX(-50%)', background: '#334155', color: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', width: '180px', textAlign: 'center', zIndex: 100, boxShadow: '0 4px 10px rgba(0,0,0,0.5)', border: '1px solid #475569' }}>
              Refresh halaman ini jika terjadi bug, layar macet, atau garis putus-putus.
            </div>
          )}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={exitRoom} className="btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>Keluar</button>
        </div>
      </div>

      {/* TOP BAR STATUS (READY / TIMER) */}
      {roomData?.gameState?.status === "waiting" || !roomData?.gameState?.status ? (
        <div style={{ textAlign: 'center', background: '#334155', padding: '10px', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#94a3b8' }}>Menunggu semua pemain klik Ready...</p>
          <button onClick={toggleReady} style={{ padding: '8px 15px', fontSize: '12px', border: 'none', borderRadius: '4px', color: 'white', background: isReady ? '#22c55e' : '#64748b', cursor: 'pointer' }}>
            {isReady ? "✅ Menunggu yang lain" : "Klik Jika Ready"}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#334155', padding: '8px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>
          <span>
            {roomData?.gameState?.status === "choosing_word"
              ? `${currentDrawerName} sedang memilih kata...`
              : (isMyTurn ? `Gambarkan: ${roomData.gameState.currentWord}` : `${currentDrawerName || 'Seseorang'} menggambar...`)
            }
          </span>
          <span style={{ color: timeLeft <= 10 ? '#ef4444' : '#facc15' }}>⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>
      )}

      {isMyTurn && isPlaying && (
        <div className="color-palette">
          {PALETTE.map(c => <button key={c} onClick={() => {setActiveColor(c); colorRef.current=c;}} className="color-btn" style={{ backgroundColor: c, border: activeColor === c ? '3px solid white' : '2px solid transparent' }} />)}
        </div>
      )}

      {/* AREA CANVAS & ANIMASI OVERLAY */}
      <div className="canvas-container" style={{ position: 'relative', margin: '0' }}>

        {/* OVERLAY: PEMILIHAN KATA (Hanya muncul untuk penggambar) */}
        {roomData?.gameState?.status === "choosing_word" && (
          <div className="overlay-anim" style={{ flexDirection: 'column', background: 'rgba(15,23,42,0.98)', zIndex: 30 }}>
            {isMyTurn ? (
              <>
                <h2 style={{ color: '#facc15', marginBottom: '20px', fontSize: '1.5rem', textAlign: 'center' }}>Pilih Kata Buat Digambar!</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '80%' }}>
                  {roomData.gameState.wordChoices?.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleWordSelect(word)}
                      style={{ padding: '15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0 #1d4ed8' }}
                      onMouseDown={e => e.currentTarget.style.transform = 'translateY(4px)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <h2 style={{ color: '#94a3b8', fontSize: '1.2rem', textAlign: 'center' }}>
                Menunggu <span style={{color: '#f8fafc'}}>{currentDrawerName}</span> memilih kata... ⏳
              </h2>
            )}
          </div>
        )}

        {countdown && <div className="overlay-anim" style={{zIndex: 25}}>{countdown}</div>}
        {roleAnim && !isSpectator && roomData?.gameState?.status !== "choosing_word" && <div className="overlay-anim" style={{ fontSize: '1.2rem', zIndex: 25 }}>{isMyTurn ? "🖌️ Giliranmu!" : "🤔 Siap Tebak!"}</div>}

        {/* OVERLAY AKHIR RONDE */}
        {roomData?.gameState?.status === 'roundEnd' && (
          <div className="overlay-anim" style={{ flexDirection: 'column', background: 'rgba(15,23,42,0.98)', zIndex: 30 }}>
            <h2 style={{ fontSize: '1.5rem', color: roomData.gameState.endReason === 'timeup' ? '#ef4444' : '#22c55e', marginBottom: '10px' }}>
              {roomData.gameState.endReason === 'timeup' ? '⏰ WAKTU HABIS!' : '🎉 SEMUA MENEBAK!'}
            </h2>
            <p style={{ fontSize: '1rem', color: 'white' }}>Jawabannya adalah: <br/><span style={{color: '#facc15', fontSize: '1.5rem'}}>{roomData.gameState.currentWord}</span></p>
          </div>
        )}

        {/* OVERLAY GAME OVER (PODIUM) */}
        {roomData?.gameState?.status === 'gameOver' && (
          <div className="overlay-anim" style={{ flexDirection: 'column', background: 'rgba(15,23,42,0.98)', zIndex: 30 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#facc15' }}>🏆 PODIUM 🏆</h2>
            {getTopPlayers().map((p, i) => (
               <div key={p.name} style={{ margin: '5px 0', fontWeight: 'bold', fontSize: i===0?'1.5rem':i===1?'1.2rem':'1rem', color: i===0?'#facc15':i===1?'#cbd5e1':'#d97706' }}>
                 #{i+1} {p.name} <span style={{fontSize:'0.8em'}}>({p.score} Pts)</span>
               </div>
            ))}
          </div>
        )}

        {isSpectator && <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', zIndex: 20, color: '#facc15', fontWeight: 'bold' }}>👀 Mode Penonton</div>}
        {isPlaying && !isMyTurn && <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}></div>}

        <canvas
          ref={canvasRef} width={400} height={300}
          style={{ width: '100%', display: 'block', touchAction: 'none', filter: roomData?.gameState?.status === "choosing_word" ? 'blur(4px)' : 'none' }}
          onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing}
          onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
        />
      </div>

      {/* AREA CHAT */}
      <div className="chat-container">
        <div className="chat-history" ref={chatContainerRef}>
          {roomData?.chat ? Object.values(roomData.chat).map((msg, i) => (
            <div key={i} className={`chat-message ${msg.isCorrect ? 'correct' : ''}`}>
              {msg.isCorrect ? msg.text : <span><b>{msg.sender}:</b> {msg.text}</span>}
            </div>
          )) : <p style={{ color: '#64748b', fontSize: '10px', textAlign: 'center' }}>Obrolan kosong...</p>}
        </div>

        {isSpectator || roomData?.gameState?.status === "choosing_word" ? (
          <div style={{ padding: '8px', textAlign: 'center', background: '#334155', color: '#94a3b8', fontSize: '12px' }}>
             {roomData?.gameState?.status === "choosing_word" ? "Menunggu penggambar..." : "Hanya penonton."}
          </div>
        ) : (
          <form onSubmit={submitGuess} className="chat-input-area">
            <input placeholder={(isMyTurn || hasGuessed) ? "Tunggu ronde selesai..." : "Ketik tebakan..."} value={guessInput} onChange={e => setGuessInput(e.target.value)} disabled={isMyTurn || hasGuessed} />
            <button type="submit" className="btn-primary" disabled={isMyTurn || hasGuessed}>Kirim</button>
          </form>
        )}
      </div>

      {/* LEADERBOARD */}
      <div className="player-list">
        {playersList.map((name) => (
          <div key={name} className="player-item">
            <span>
              {name} {roomData?.gameState?.status === "waiting" && (roomData.players[name].isReady ? " ✅" : " ⏳")}
              {(isPlaying || roomData?.gameState?.status === "choosing_word" || roomData?.gameState?.status === "starting") && currentDrawerName === name ? ' 🖌️' : ''}
              {correctGuessers.includes(name) ? ' ✔️' : ''}
              {roomData?.gameState?.status !== "waiting" && !turnOrder.includes(name) ? ' 👀' : ''}
            </span>
            <span className="score-badge">{roomData.players[name].score || 0} Pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
