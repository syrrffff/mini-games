import { useState } from 'react';

const questions = {
  truth: [
    "Siapa orang di circle ini yang paling sering bikin lu emosi tapi lu tahan?",
    "Apa satu kebohongan yang lu ceritain ke kita tapi kita percaya?",
    "Kapan terakhir kali lu nangis dan gara-gara apa?",
    "Sebutin satu hal yang lu iriin dari orang di sebelah kanan lu.",
    "Berapa saldo rekening lu sekarang? Buka M-Banking!"
  ],
  dare: [
    "Jajanin minuman paling murah buat 1 orang random di circle ini.",
    "Chat mantan/gebetan sekarang, ketik 'aku kangen' terus langsung mode pesawat.",
    "Kasih HP lu ke orang sebelah kiri, biarin dia bajak IG Story/WA Story lu bebas selama 1 menit.",
    "Ngomong pakai bahasa baku kayak pembawa berita tiap kali diajak ngobrol selama 15 menit ke depan.",
    "Telepon orang tua lu sekarang, bilang 'Makasih ya mah/pah udah ngelahirin aku', terus matiin."
  ]
};

export default function TruthOrDare() {
  const [result, setResult] = useState('Pilih mental lu di bawah.');
  const [type, setType] = useState('');

  const handlePick = (choice) => {
    const list = questions[choice];
    const randomItem = list[Math.floor(Math.random() * list.length)];
    setType(choice.toUpperCase());
    setResult(randomItem);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Truth or Dare</h2>

      <div className="card-tod" style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {type && (
          <h3 style={{ margin: '0 0 15px 0', color: type === 'TRUTH' ? '#3b82f6' : '#ef4444', letterSpacing: '2px' }}>
            {type}
          </h3>
        )}
        <p style={{ fontSize: '18px', margin: 0, fontWeight: type ? 600 : 400, color: type ? '#f8fafc' : '#64748b' }}>
          {result}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
        <button onClick={() => handlePick('truth')} className="btn-primary" style={{ flex: 1, padding: '20px 0', fontSize: '18px' }}>
          TRUTH
        </button>
        <button onClick={() => handlePick('dare')} className="btn-danger" style={{ flex: 1, padding: '20px 0', fontSize: '18px' }}>
          DARE
        </button>
      </div>
    </div>
  );
}
