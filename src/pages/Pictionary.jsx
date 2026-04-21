import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { ref, update, onValue, get, remove, push, onDisconnect, query, orderByChild, limitToLast, increment } from 'firebase/database';
import ConfirmModal from '../components/ConfirmModal';

// --- DATABASE TEBAK GAMBAR (100+ KATA SUPER ABSURD & RANDOM) ---
const WORD_LIST = [
  "Kucing", "Sepeda", "Rumah", "Pohon", "Mobil", "Gunung", "Gitar", "Laptop", "Pesawat", "Buku",
  "Kacamata", "Sepatu", "Jam Tangan", "Kopi", "Kipas Angin", "Dispenser", "Kulkas", "Mesin Cuci",
  "Rice Cooker", "Setrika", "Jemuran", "Sapu Lidi", "Pengki", "Ember", "Gayung", "Sikat Gigi",
  "Sampo Sachet", "Gunting Kuku", "Cotton Bud", "Karet Gelang", "Peniti", "Televisi Tabung",
  "Kalkulator", "Gembok", "Obeng", "Palu", "Gergaji", "Kawat Gigi", "Gigi Palsu", "Rambut Palsu",
  "Polisi Tidur", "Lampu Merah", "Tiang Listrik", "Angkot", "Becak", "Gerobak Bakso", "Pintu Tol",
  "Zebra Cross", "Tukang Parkir", "Helm Bogo", "Knalpot Racing", "Spion", "Tilang Polisi", "CCTV",
  "Jas Hujan Kelelawar", "Warnet", "Warkop", "Sinyal Lemah", "Centang Biru", "Colokan Listrik",
  "Powerbank", "Headset Kusut", "Es Teh Plastik", "Nasi Bungkus Karet Dua", "Seblak Ceker",
  "Martabak Telur", "Tahu Bulat", "Gorengan", "Kerupuk Putih", "Sate Ayam", "Es Campur", "Pete",
  "Jengkol", "Durian", "Kopi Hitam", "Mendoan", "Mie Ayam", "Bakso Beranak", "Kecoak Terbang",
  "Nyamuk Kawin", "Lalat", "Cicak Putus Ekor", "Tokek", "Ulat Bulu", "Kelabang", "Buaya Darat",
  "Gurita", "Kaktus", "Bunga Bangkai", "Pohon Beringin", "Awan Mendung", "Petir", "Pelangi",
  "Bulu Babi", "Lintah", "Tikus Got", "Burung Hantu", "Kucing Oyen", "Dompet Kosong", "Sakit Gigi",
  "Kesemutan", "Kentut", "Masuk Angin", "Tanggal Tua", "Cicilan", "Bau Badan", "Kutu Rambut",
  "Panu", "Ketombe", "Kurang Tidur", "Ngantuk Berat", "Patah Hati", "Mimpi Buruk", "Kebelet Boker",
  "Lupa Password", "Mabuk Laut", "Kesandung Batu", "Gaji Numpang Lewat", "Pocong", "Tuyul",
  "Kuntilanak", "Alien", "UFO", "Ninja", "Zombie", "Bajak Laut", "Putri Duyung", "Malaikat"
];

const PALETTE = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#facc15'];

// --- GENERATOR SUARA EFFECT ---
const playSound = (type) => {
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
      gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'start') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.2, now); osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'correct') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
      gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'gameover') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(523.25, now + 0.1); osc.frequency.setValueAtTime(659.25, now + 0.2);
      gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.8);
      osc.start(now); osc.stop(now + 0.8);
    } else if (type === 'tick') {
      osc.type = 'square'; osc.frequency.setValueAtTime(900, now);
      gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    }
  } catch(e) { console.error("Audio error", e); }
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

  // State Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);

  // State Riwayat Kata & Timer
  const [usedWords, setUsedWords] = useState(() => JSON.parse(localStorage.getItem('pict_usedWords')) || []);
  const [chooseTimer, setChooseTimer] = useState(8);

  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '' });
  const showAlert = (title, message) => setAlertData({ isOpen: true, title, message });

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const colorRef = useRef('#000000');
  const chatContainerRef = useRef(null);
  const serverOffsetRef = useRef(0);

  // --- AMBIL DATA LEADERBOARD SAAT APLIKASI DIBUKA ---
  useEffect(() => {
    if (!isJoined) {
      const currentMonth = new Date().toISOString().slice(0, 7); // Contoh: "2026-04"
      const lbRef = query(ref(db, `leaderboard/${currentMonth}`), orderByChild('score'), limitToLast(10));

      const unsub = onValue(lbRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Ubah object ke array lalu urutkan dari skor tertinggi
          const lbArray = Object.values(data).sort((a, b) => b.score - a.score);
          setLeaderboard(lbArray);
        } else {
          setLeaderboard([]);
        }
      });
      return () => unsub();
    }
  }, [isJoined]);

  useEffect(() => {
    const savedRoom = localStorage.getItem('roomCode');
    const savedName = localStorage.getItem('playerName');
    if (savedRoom && savedName) { setRoomCode(savedRoom); setPlayerName(savedName); connectToRoom(savedRoom, savedName); }
  }, []);

  useEffect(() => {
    const offsetRef = ref(db, ".info/serverTimeOffset");
    const unsub = onValue(offsetRef, (snap) => {
      serverOffsetRef.current = snap.val() || 0;
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('pict_usedWords', JSON.stringify(usedWords));
  }, [usedWords]);

  useEffect(() => {
    if (roomData?.players?.[playerName]?.score !== undefined) {
      localStorage.setItem(`pict_score_${playerName}`, roomData.players[playerName].score);
    }
  }, [roomData?.players, playerName]);

  const connectToRoom = (code, name) => {
    const roomRef = ref(db, `rooms/${code}`);
    const playerRef = ref(db, `rooms/${code}/players/${name}`);
    onDisconnect(playerRef).remove();

    const savedScore = parseInt(localStorage.getItem(`pict_score_${name}`)) || 0;

    get(playerRef).then((snap) => {
      if (!snap.exists()) {
        update(playerRef, { score: savedScore, isReady: false });
      }
    });

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
    if (!roomCode || !playerName) return showAlert("⚠️ Oops!", "Jangan lupa isi Nama dan Kode Room dulu bro!");
    localStorage.setItem('roomCode', roomCode);
    localStorage.setItem('playerName', playerName);
    localStorage.setItem(`pict_score_${playerName}`, 0);

    connectToRoom(roomCode, playerName);
    playSound('beep');
  };

  const exitRoom = async () => {
    const playersRef = ref(db, `rooms/${roomCode}/players`);
    const snap = await get(playersRef);
    if (snap.exists() && Object.keys(snap.val()).length <= 1) remove(ref(db, `rooms/${roomCode}`));
    else remove(ref(db, `rooms/${roomCode}/players/${playerName}`));

    localStorage.clear();
    setIsJoined(false);
    setRoomData(null);
  };

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

  const getUnusedWords = (count = 3) => {
    let available = WORD_LIST.filter(w => !usedWords.includes(w));
    if (available.length < count) {
      available = [...WORD_LIST];
      setUsedWords([]);
    }
    return available.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  const startGameSequence = () => {
    const activePlayers = Object.keys(roomData.players);
    update(ref(db, `rooms/${roomCode}/gameState`), {
      status: "choosing_word",
      currentDrawerIndex: 0,
      turnOrder: activePlayers,
      wordChoices: getUnusedWords(3),
      currentWord: "",
      canvasData: "",
      correctGuessers: [],
      turnEndTime: null
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
        wordChoices: getUnusedWords(3),
        currentWord: "",
        canvasData: "",
        correctGuessers: [],
        turnEndTime: null
      });
    }
  };

  // --- LOGIKA TIMER PILIH KATA (8 DETIK) ---
  useEffect(() => {
    if (roomData?.gameState?.status === 'choosing_word' && isMyTurn) {
      setChooseTimer(8);
      const interval = setInterval(() => {
        setChooseTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            const choices = roomData.gameState.wordChoices;
            if (choices && choices.length > 0) {
              const randomPick = choices[Math.floor(Math.random() * choices.length)];
              handleWordSelect(randomPick);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [roomData?.gameState?.status, isMyTurn, roomData?.gameState?.wordChoices]);

  const handleWordSelect = (selectedWord) => {
    setUsedWords(prev => [...prev, selectedWord]);
    update(ref(db, `rooms/${roomCode}/gameState`), {
      status: "starting",
      currentWord: selectedWord,
      wordChoices: null
    });
  };

  // --- SINKRONISASI ANIMASI 3..2..1 ---
  useEffect(() => {
    if (roomData?.gameState?.status === 'starting') {
      let count = 3;
      setCountdown(count);
      playSound('beep');

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
          playSound('beep');
        } else if (count === 0) {
          setCountdown("MULAI!");
          playSound('start');
        } else {
          clearInterval(interval);
          setCountdown(null);
          if (isMyTurn) {
            const currentServerTime = Date.now() + serverOffsetRef.current;
            update(ref(db, `rooms/${roomCode}/gameState`), {
              status: 'playing',
              turnEndTime: currentServerTime + 90000
            });
          }
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [roomData?.gameState?.status, isMyTurn, roomCode]);

  useEffect(() => {
    if (roomData?.gameState?.status === 'playing') {
      setCountdown(null);
      setRoleAnim(true);
      const timer = setTimeout(() => setRoleAnim(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setRoleAnim(false);
    }
  }, [roomData?.gameState?.status]);

  useEffect(() => {
    if (roomData?.gameState?.status === 'playing' && timeLeft <= 5 && timeLeft > 0) {
      playSound('tick');
    }
  }, [timeLeft, roomData?.gameState?.status]);

  // --- TIMER GAMEPLAY & PEMBERIAN POIN LEADERBOARD GLOBAL ---
  useEffect(() => {
    if (roomData?.gameState?.status === 'playing' && roomData?.gameState?.turnEndTime) {
      const interval = setInterval(() => {
        const currentServerTime = Date.now() + serverOffsetRef.current;
        const remaining = Math.floor((roomData.gameState.turnEndTime - currentServerTime) / 1000);

        if (remaining <= 0) {
          clearInterval(interval);
          if (isMyTurn) {
             const currentScore = roomData.players[playerName].score || 0;
             if (correctGuessers.length === 0) {
               // Tambah poin di room
               update(ref(db, `rooms/${roomCode}/players/${playerName}`), { score: currentScore + 10 });

               // Tambah poin di Leaderboard Global
               const currentMonth = new Date().toISOString().slice(0, 7);
               const safeKey = playerName.toLowerCase().replace(/[.#$\[\]]/g, '_');
               update(ref(db, `leaderboard/${currentMonth}/${safeKey}`), {
                 score: increment(10), name: playerName
               });
             }
             update(ref(db, `rooms/${roomCode}/gameState`), { status: 'roundEnd', endReason: 'timeup' });
          }
          setTimeLeft(0);
        } else {
          setTimeLeft(remaining);
        }
      }, 500);
      return () => clearInterval(interval);
    } else if (roomData?.gameState?.status === 'starting' || roomData?.gameState?.status === 'waiting' || roomData?.gameState?.status === 'choosing_word') {
        setTimeLeft(90);
    }
  }, [roomData?.gameState?.status, roomData?.gameState?.turnEndTime, isMyTurn, correctGuessers.length]);

  useEffect(() => {
    if (roomData?.gameState?.status === 'roundEnd') {
      roomData.gameState.endReason === 'timeup' ? playSound('wrong') : playSound('correct');
      const timer = setTimeout(() => { if (isMyTurn) nextTurn(); }, 4000);
      return () => clearTimeout(timer);
    }
  }, [roomData?.gameState?.status]);

  useEffect(() => {
    if (roomData?.gameState?.status === 'gameOver') {
      playSound('gameover');
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
        playSound('correct');

        const points = Math.max(2, 10 - (correctGuessers.length * 2));
        const newCorrectGuessers = [...correctGuessers, playerName];

        // Tambah poin di room
        update(ref(db, `rooms/${roomCode}/players/${playerName}`), { score: (roomData.players[playerName].score || 0) + points });

        // Tambah poin di Leaderboard Global
        const currentMonth = new Date().toISOString().slice(0, 7);
        const safeKey = playerName.toLowerCase().replace(/[.#$\[\]]/g, '_');
        update(ref(db, `leaderboard/${currentMonth}/${safeKey}`), {
          score: increment(points), name: playerName
        });

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

  // --- RENDER SCREEN BELUM MASUK ROOM + LEADERBOARD ---
  if (!isJoined) {
    return (
      <div>
        <ConfirmModal isOpen={alertData.isOpen} title={alertData.title} message={alertData.message} confirmText="Oke Paham!" confirmColor="#3b82f6" onConfirm={() => setAlertData({ ...alertData, isOpen: false })} />
        <Link to="/" style={{ display: 'inline-block', color: '#94a3b8', textDecoration: 'none', marginTop: '10px', fontSize: '14px', fontWeight: 'bold' }}>← Kembali</Link>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>🎨 Tebak Gambar</h2>

        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
          <input className="input-field" placeholder="Nama Kamu" value={playerName} onChange={e => setPlayerName(e.target.value)} />
          <input className="input-field" placeholder="Kode Room Bebas" value={roomCode} onChange={e => setRoomCode(e.target.value)} />
          <button onClick={joinRoom} className="btn-primary btn-action">Masuk Room</button>
        </div>

        {/* LEADERBOARD BULANAN UI */}
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginTop: '20px', border: '2px solid #334155' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#facc15', textAlign: 'center' }}>🏆 Top 10 Bulan Ini</h3>
          {leaderboard.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.map((player, index) => {
                let rankMedal = `${index + 1}.`;
                if (index === 0) rankMedal = '🥇';
                if (index === 1) rankMedal = '🥈';
                if (index === 2) rankMedal = '🥉';

                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '10px 15px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                    <span>{rankMedal} <span style={{color: '#f8fafc', marginLeft: '5px'}}>{player.name}</span></span>
                    <span style={{ color: '#22c55e' }}>{player.score} Pts</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', margin: 0 }}>Belum ada data bulan ini. Jadilah yang pertama!</p>
          )}
        </div>
      </div>
    );
  }

  const isReady = roomData?.players[playerName]?.isReady;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px' , marginTop: '10px'}}>

      {/* CSS KHUSUS ANIMASI LOADING BAR & CARD UI */}
      <style>{`
        @keyframes shrinkBar { from { width: 100%; } to { width: 0%; } }
        @keyframes blinkText { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
      `}</style>

      {/* HEADER NAVIGASI & INFO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Room: <span style={{ color: '#3b82f6' }}>{roomCode}</span></h3>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '15px', position: 'relative' }}>
          <button onClick={() => setShowTooltip(!showTooltip)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0 }}>🐛</button>
          {showTooltip && (
            <div style={{ position: 'absolute', top: '35px', left: '50%', transform: 'translateX(-50%)', background: '#334155', color: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', width: '180px', textAlign: 'center', zIndex: 100, boxShadow: '0 4px 10px rgba(0,0,0,0.5)', border: '1px solid #475569' }}>
              Waktu sudah tersinkronisasi sempurna dengan satelit Google.
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
              : roomData?.gameState?.status === "starting"
                 ? "Bersiap-siap..."
                 : (isMyTurn ? `Gambarkan: ${roomData.gameState.currentWord}` : `${currentDrawerName || 'Seseorang'} menggambar...`)
            }
          </span>
          <span style={{ color: timeLeft <= 5 ? '#ef4444' : '#facc15', animation: timeLeft <= 5 ? 'blinkText 0.5s infinite' : 'none' }}>
            ⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}

      {isMyTurn && isPlaying && (
        <div className="color-palette">
          {PALETTE.map(c => <button key={c} onClick={() => {setActiveColor(c); colorRef.current=c;}} className="color-btn" style={{ backgroundColor: c, border: activeColor === c ? '3px solid white' : '2px solid transparent' }} />)}
        </div>
      )}

      {/* AREA CANVAS & ANIMASI OVERLAY */}
      <div className="canvas-container" style={{ position: 'relative', margin: '0' }}>

        {/* OVERLAY: PEMILIHAN KATA UI DIPERKECIL (Hanya di tengah canvas) */}
        {roomData?.gameState?.status === "choosing_word" && (
          <div className="overlay-anim" style={{ flexDirection: 'column', background: 'rgba(15,23,42,0.85)', zIndex: 30 }}>
            {isMyTurn ? (
              <div style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', width: '85%', border: '2px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                <h3 style={{ color: '#facc15', margin: '0 0 10px 0', fontSize: '1.1rem', textAlign: 'center' }}>Pilih Kata!</h3>

                {/* Bar Waktu Memilih Kata */}
                <div style={{ width: '100%', background: '#0f172a', height: '4px', borderRadius: '2px', marginBottom: '15px', overflow: 'hidden' }}>
                   <div style={{ width: `${(chooseTimer / 8) * 100}%`, background: '#3b82f6', height: '100%', transition: 'width 1s linear' }} />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {roomData.gameState.wordChoices?.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleWordSelect(word)}
                      style={{ flex: '1 1 45%', padding: '10px 5px', background: '#334155', color: 'white', border: '1px solid #475569', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', background: '#1e293b', padding: '15px', borderRadius: '12px', border: '1px solid #334155' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                  Menunggu <b style={{color: '#f8fafc'}}>{currentDrawerName}</b> memilih...
                </p>
                <div style={{ width: '150px', height: '4px', background: '#0f172a', borderRadius: '2px', overflow: 'hidden', margin: '0 auto' }}>
                   <div style={{ width: '100%', height: '100%', background: '#facc15', animation: 'shrinkBar 8s linear forwards' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* OVERLAY: ANIMASI MULAI 3...2...1 */}
        {roomData?.gameState?.status === "starting" && countdown && (
          <div className="overlay-anim" style={{zIndex: 25, flexDirection: 'column'}}>
            <div style={{fontSize: '4rem', textShadow: '2px 2px 10px rgba(0,0,0,0.8)'}}>{countdown}</div>
            <div style={{ width: '150px', height: '4px', background: '#334155', marginTop: '20px', borderRadius: '2px', overflow: 'hidden' }}>
               <div style={{ width: '100%', height: '100%', background: '#22c55e', animation: 'shrinkBar 3s linear forwards' }} />
            </div>
          </div>
        )}

        {/* ANIMASI "GILIRANMU / SIAP TEBAK" */}
        {roleAnim && !isSpectator && roomData?.gameState?.status === "playing" && (
           <div className="overlay-anim" style={{ fontSize: '1.2rem', zIndex: 25, animation: 'fadeOut 2s forwards' }}>
             {isMyTurn ? "🖌️ Waktu Berjalan!" : "🤔 Mulai Nebak!"}
           </div>
        )}

        {/* OVERLAY AKHIR RONDE */}
        {roomData?.gameState?.status === 'roundEnd' && (
          <div className="overlay-anim" style={{ flexDirection: 'column', background: 'rgba(15,23,42,0.95)', zIndex: 30 }}>
            <h2 style={{ fontSize: '1.5rem', color: roomData.gameState.endReason === 'timeup' ? '#ef4444' : '#22c55e', margin: '0 0 5px 0' }}>
              {roomData.gameState.endReason === 'timeup' ? '⏰ WAKTU HABIS!' : '🎉 SEMUA MENEBAK!'}
            </h2>
            <p style={{ fontSize: '1rem', color: 'white', marginBottom: '15px' }}>Jawabannya: <br/><span style={{color: '#facc15', fontSize: '1.3rem', fontWeight: 'bold'}}>{roomData.gameState.currentWord}</span></p>
            <div style={{ width: '150px', height: '4px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
               <div style={{ width: '100%', height: '100%', background: '#3b82f6', animation: 'shrinkBar 4s linear forwards' }} />
            </div>
          </div>
        )}

        {/* OVERLAY GAME OVER (PODIUM JUARA) */}
        {roomData?.gameState?.status === 'gameOver' && (
          <div className="overlay-anim" style={{ flexDirection: 'column', background: 'rgba(15,23,42,0.98)', zIndex: 30 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '15px', color: '#facc15' }}>🏆 PODIUM 🏆</h2>
            {getTopPlayers().map((p, i) => (
               <div key={p.name} style={{ margin: '3px 0', fontWeight: 'bold', fontSize: i===0?'1.3rem':i===1?'1.1rem':'0.9rem', color: i===0?'#facc15':i===1?'#cbd5e1':'#d97706' }}>
                 #{i+1} {p.name} <span style={{fontSize:'0.8em'}}>({p.score} Pts)</span>
               </div>
            ))}
            <div style={{ width: '200px', height: '4px', background: '#334155', marginTop: '20px', borderRadius: '2px', overflow: 'hidden' }}>
               <div style={{ width: '100%', height: '100%', background: '#facc15', animation: 'shrinkBar 7s linear forwards' }} />
            </div>
          </div>
        )}

        {isSpectator && <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', zIndex: 20, color: '#facc15', fontWeight: 'bold', fontSize: '12px' }}>👀 Mode Penonton</div>}
        {isPlaying && !isMyTurn && <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}></div>}

        <canvas
          ref={canvasRef} width={400} height={300}
          style={{ width: '100%', display: 'block', touchAction: 'none', filter: roomData?.gameState?.status === "choosing_word" ? 'blur(4px)' : 'none' }}
          onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing}
          onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
        />
      </div>

      {/* CSS TAMBAHAN UNTUK FADEOUT */}
      <style>{`
        @keyframes fadeOut { 0% {opacity: 1;} 70% {opacity: 1;} 100% {opacity: 0;} }
      `}</style>

      {/* AREA CHAT */}
      <div className="chat-container">
        <div className="chat-history" ref={chatContainerRef}>
          {roomData?.chat ? Object.values(roomData.chat).map((msg, i) => (
            <div key={i} className={`chat-message ${msg.isCorrect ? 'correct' : ''}`}>
              {msg.isCorrect ? msg.text : <span><b>{msg.sender}:</b> {msg.text}</span>}
            </div>
          )) : <p style={{ color: '#64748b', fontSize: '10px', textAlign: 'center' }}>Obrolan kosong...</p>}
        </div>

        {isSpectator || roomData?.gameState?.status === "choosing_word" || roomData?.gameState?.status === "starting" ? (
          <div style={{ padding: '8px', textAlign: 'center', background: '#334155', color: '#94a3b8', fontSize: '12px' }}>
             {roomData?.gameState?.status === "choosing_word" || roomData?.gameState?.status === "starting" ? "Menyiapkan ronde..." : "Hanya penonton."}
          </div>
        ) : (
          <form onSubmit={submitGuess} className="chat-input-area">
            <input placeholder={(isMyTurn || hasGuessed) ? "Tunggu ronde selesai..." : "Ketik tebakan..."} value={guessInput} onChange={e => setGuessInput(e.target.value)} disabled={isMyTurn || hasGuessed} />
            <button type="submit" className="btn-primary" disabled={isMyTurn || hasGuessed}>Kirim</button>
          </form>
        )}
      </div>

      {/* LEADERBOARD LOKAL (ROOM) */}
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
