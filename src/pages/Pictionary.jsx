import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, update, onValue, get, remove, push } from 'firebase/database';

const WORD_LIST = ["Kucing", "Sepeda", "Rumah", "Pohon", "Mobil", "Gunung", "Gitar", "Laptop", "Pesawat", "Buku", "Kacamata", "Sepatu"];
const PALETTE = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#facc15'];

export default function Pictionary() {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [roomData, setRoomData] = useState(null);

  const [guessInput, setGuessInput] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [roleAnim, setRoleAnim] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [activeColor, setActiveColor] = useState('#000000');

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const colorRef = useRef('#000000');
  const chatContainerRef = useRef(null); // Ref baru khusus untuk scroll kotak chat

  // 1. KONEKSI KE FIREBASE
  useEffect(() => {
    const savedRoom = localStorage.getItem('roomCode');
    const savedName = localStorage.getItem('playerName');
    if (savedRoom && savedName) {
      setRoomCode(savedRoom);
      setPlayerName(savedName);
      connectToRoom(savedRoom, savedName);
    }
  }, []);

  const connectToRoom = (code, name) => {
    const roomRef = ref(db, `rooms/${code}`);
    get(ref(db, `rooms/${code}/players/${name}`)).then((snapshot) => {
      if (!snapshot.exists()) {
        update(ref(db, `rooms/${code}/players/${name}`), { score: 0, isReady: false });
      }
    });

    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
        if (data.gameState?.canvasData && canvasRef.current) {
          if (data.gameState.currentDrawer !== name) {
            const image = new Image();
            image.src = data.gameState.canvasData;
            image.onload = () => {
              const ctx = canvasRef.current.getContext('2d');
              ctx.clearRect(0, 0, 400, 300);
              ctx.drawImage(image, 0, 0);
            };
          }
        } else if (data.gameState?.canvasData === "" && canvasRef.current) {
           canvasRef.current.getContext('2d').clearRect(0, 0, 400, 300);
        }
      }
    });
    setIsJoined(true);
  };

  const joinRoom = () => {
    if (!roomCode || !playerName) return alert("Isi nama dan kode room!");
    localStorage.setItem('roomCode', roomCode);
    localStorage.setItem('playerName', playerName);
    connectToRoom(roomCode, playerName);
  };

  const exitRoom = () => {
    remove(ref(db, `rooms/${roomCode}/players/${playerName}`));
    localStorage.clear();
    setIsJoined(false);
    setRoomData(null);
  };

  // 2. LOGIKA STATUS & AUTO-START
  const toggleReady = () => {
    const currentReady = roomData?.players[playerName]?.isReady || false;
    update(ref(db, `rooms/${roomCode}/players/${playerName}`), { isReady: !currentReady });
  };

  const playersList = roomData?.players ? Object.keys(roomData.players) : [];
  const allReady = playersList.length > 1 && playersList.every(p => roomData.players[p].isReady);
  const currentDrawerName = playersList[roomData?.gameState?.currentDrawerIndex || 0];
  const isMyTurn = currentDrawerName === playerName;
  const isPlaying = roomData?.gameState?.status === "playing";

  const startGameSequence = () => {
    update(ref(db, `rooms/${roomCode}/gameState`), {
      status: "starting",
      currentDrawerIndex: 0,
      currentWord: WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)],
      canvasData: ""
    });
    push(ref(db, `rooms/${roomCode}/chat`), { sender: "Sistem", text: "Semua Ready! Game Dimulai!", isCorrect: true });
    playersList.forEach(p => update(ref(db, `rooms/${roomCode}/players/${p}`), { isReady: false }));
  };

  useEffect(() => {
    if ((roomData?.gameState?.status === "waiting" || !roomData?.gameState?.status) && allReady) {
      if (playersList[0] === playerName) startGameSequence();
    }
  }, [allReady, roomData?.gameState?.status]);

  const nextTurn = () => {
    const nextIndex = roomData.gameState.currentDrawerIndex + 1;
    if (nextIndex >= playersList.length) {
      update(ref(db, `rooms/${roomCode}/gameState`), { status: "waiting" });
      push(ref(db, `rooms/${roomCode}/chat`), { sender: "Sistem", text: "Satu putaran selesai! Silakan Ready kembali.", isCorrect: true });
      playersList.forEach(p => update(ref(db, `rooms/${roomCode}/players/${p}`), { isReady: false }));
    } else {
      update(ref(db, `rooms/${roomCode}/gameState`), {
        status: "starting",
        currentDrawerIndex: nextIndex,
        currentWord: WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)],
        canvasData: ""
      });
    }
  };

  useEffect(() => {
    if (roomData?.gameState?.status === 'starting') {
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count--;
        if (count > 0) setCountdown(count);
        else if (count === 0) setCountdown("MULAI!");
        else {
          clearInterval(interval);
          setCountdown(null);
          if (isMyTurn) update(ref(db, `rooms/${roomCode}/gameState`), { status: 'playing', turnEndTime: Date.now() + 120000 });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [roomData?.gameState?.status, isMyTurn, roomCode]);

  useEffect(() => {
    if (roomData?.gameState?.status === 'playing') {
      setRoleAnim(true);
      const roleTimer = setTimeout(() => setRoleAnim(false), 2000);

      const interval = setInterval(() => {
        const remaining = Math.floor((roomData.gameState.turnEndTime - Date.now()) / 1000);
        if (remaining <= 0) {
          clearInterval(interval);
          if (isMyTurn) {
             const currentWord = roomData.gameState.currentWord;
             const currentScore = roomData.players[playerName].score || 0;
             update(ref(db, `rooms/${roomCode}/players/${playerName}`), { score: currentScore + 10 });
             push(ref(db, `rooms/${roomCode}/chat`), { sender: "Sistem", text: `Waktu Habis! Jawaban: ${currentWord}. ${playerName} dapat +10 Poin.`, isCorrect: true });
             nextTurn();
          }
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
      return () => { clearTimeout(roleTimer); clearInterval(interval); };
    }
  }, [roomData?.gameState?.status, roomData?.gameState?.turnEndTime, isMyTurn]);

  // FIX AUTO-SCROLL LONCAT: Hanya scroll kotak obrolan, bukan layarnya, dan hanya saat ada chat masuk
  const chatMsgCount = roomData?.chat ? Object.keys(roomData.chat).length : 0;
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMsgCount]);

  // 3. FUNGSI MENGGAMBAR & PALET
  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => {
    if (!isMyTurn || !isPlaying) return;
    isDrawingRef.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = colorRef.current;

    // FIX GARIS KEBESARAN: Ukuran pensil diperkecil dari 4 ke 2
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !isMyTurn || !isPlaying) return;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current || !isMyTurn || !isPlaying) return;
    isDrawingRef.current = false;
    update(ref(db, `rooms/${roomCode}/gameState`), { canvasData: canvasRef.current.toDataURL() });
  };

  const changeColor = (color) => {
    setActiveColor(color);
    colorRef.current = color;
  };

  // 4. CEK TEBAKAN CHAT
  const submitGuess = (e) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    if (!isPlaying) {
      push(ref(db, `rooms/${roomCode}/chat`), { sender: playerName, text: guessInput, isCorrect: false });
    } else {
      const currentWord = roomData?.gameState?.currentWord;
      if (guessInput.toLowerCase() === currentWord.toLowerCase()) {
        push(ref(db, `rooms/${roomCode}/chat`), { sender: playerName, text: `${playerName} MENEBAK BENAR! 🎉`, isCorrect: true });
        const currentScore = roomData.players[playerName].score || 0;
        update(ref(db, `rooms/${roomCode}/players/${playerName}`), { score: currentScore + 10 });
        if (!isMyTurn) nextTurn();
      } else {
        push(ref(db, `rooms/${roomCode}/chat`), { sender: playerName, text: guessInput, isCorrect: false });
      }
    }
    setGuessInput('');
  };

  // --- RENDER LOBBY ---
  if (!isJoined) {
    return (
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🎨 Tebak Gambar</h2>
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
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Room: <span style={{ color: '#3b82f6' }}>{roomCode}</span></h3>
        <button onClick={exitRoom} className="btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }}>Keluar</button>
      </div>

      {/* HEADER STATUS */}
      {roomData?.gameState?.status === "waiting" || !roomData?.gameState?.status ? (
        <div style={{ textAlign: 'center', background: '#334155', padding: '10px', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#94a3b8' }}>Menunggu semua pemain klik Ready...</p>
          <button
            onClick={toggleReady}
            style={{ padding: '8px 15px', fontSize: '12px', border: 'none', borderRadius: '4px', color: 'white', background: isReady ? '#22c55e' : '#64748b', cursor: 'pointer' }}
          >
            {isReady ? "✅ Menunggu yang lain" : "Klik Jika Ready"}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#334155', padding: '8px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>
          <span>{isMyTurn ? `Gambarkan: ${roomData.gameState.currentWord}` : `${currentDrawerName} sedang menggambar...`}</span>
          <span style={{ color: timeLeft <= 10 ? '#ef4444' : '#facc15' }}>⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>
      )}

      {/* PALET WARNA (Hanya untuk penggambar) */}
      {isMyTurn && isPlaying && (
        <div className="color-palette">
          {PALETTE.map(c => (
            <button
              key={c} onClick={() => changeColor(c)}
              className="color-btn"
              style={{ backgroundColor: c, border: activeColor === c ? '3px solid white' : '2px solid transparent' }}
            />
          ))}
        </div>
      )}

      {/* CANVAS */}
      <div className="canvas-container" style={{ position: 'relative', margin: '0' }}>
        {countdown && <div className="overlay-anim">{countdown}</div>}
        {roleAnim && <div className="overlay-anim" style={{ fontSize: '1.2rem' }}>{isMyTurn ? "🖌️ Giliranmu!" : "🤔 Siap Tebak!"}</div>}
        {isPlaying && !isMyTurn && <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}></div>}

        <canvas
          ref={canvasRef} width={400} height={300}
          style={{ width: '100%', display: 'block', touchAction: 'none' }}
          onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing}
          onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
        />
      </div>

      {/* CHAT AREA SELALU AKTIF */}
      <div className="chat-container">
        {/* Tambahkan ref ke div chat-history */}
        <div className="chat-history" ref={chatContainerRef}>
          {roomData?.chat ? Object.values(roomData.chat).map((msg, i) => (
            <div key={i} className={`chat-message ${msg.isCorrect ? 'correct' : ''}`}>
              {msg.isCorrect ? msg.text : <span><b>{msg.sender}:</b> {msg.text}</span>}
            </div>
          )) : <p style={{ color: '#64748b', fontSize: '10px', textAlign: 'center' }}>Obrolan kosong...</p>}
        </div>

        <form onSubmit={submitGuess} className="chat-input-area">
          <input placeholder={(!isMyTurn || !isPlaying) ? "Ketik sesuatu..." : "Tunggu giliran tebak..."} value={guessInput} onChange={e => setGuessInput(e.target.value)} disabled={isMyTurn && isPlaying} />
          <button type="submit" className="btn-primary" disabled={isMyTurn && isPlaying}>Kirim</button>
        </form>
      </div>

      {/* LEADERBOARD KECIL */}
      <div className="player-list">
        {playersList.map((name) => (
          <div key={name} className="player-item">
            <span>
              {name}
              {roomData?.gameState?.status === "waiting" && (roomData.players[name].isReady ? " ✅" : " ⏳")}
              {isPlaying && currentDrawerName === name ? ' 🖌️' : ''}
            </span>
            <span className="score-badge">{roomData.players[name].score || 0} Pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
