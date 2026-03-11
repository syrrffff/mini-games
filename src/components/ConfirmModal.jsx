// File: src/components/ConfirmModal.jsx

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Hapus",
  cancelText = "Batal",
  confirmColor = "#ef4444" // Default merah untuk hapus
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15,23,42,0.85)', zIndex: 9999, // Z-index tinggi agar selalu di paling depan
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <style>{`
        @keyframes modalPopUp {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div style={{
        background: '#1e293b', border: '2px solid #334155', borderRadius: '12px',
        padding: '25px 20px', width: '80%', maxWidth: '320px', textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        animation: 'modalPopUp 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#facc15', fontSize: '20px' }}>{title}</h3>
        <p style={{ margin: '0 0 25px 0', color: '#94a3b8', fontSize: '14px' }}>{message}</p>

        <div style={{ display: 'flex', gap: '10px' }}>
          {onCancel && (
            <button onClick={onCancel} style={{ flex: 1, padding: '12px', background: '#475569', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.1s' }} onMouseDown={e => e.target.style.transform = 'scale(0.95)'} onMouseUp={e => e.target.style.transform = 'scale(1)'}>
              {cancelText}
            </button>
          )}
          <button onClick={onConfirm} style={{ flex: 1, padding: '12px', background: confirmColor, color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.1s' }} onMouseDown={e => e.target.style.transform = 'scale(0.95)'} onMouseUp={e => e.target.style.transform = 'scale(1)'}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
