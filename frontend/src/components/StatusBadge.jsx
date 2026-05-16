const STATUS_CONFIG = {
  online:   { label: 'En línea',  bg: 'rgba(34,197,94,0.1)',   color: '#22c55e', pulse: true  },
  paused:   { label: 'Pausado',   bg: 'rgba(245,168,0,0.1)',   color: '#F5A800', pulse: false },
  sleeping: { label: 'Dormido',   bg: 'rgba(71,85,105,0.15)',  color: '#94a3b8', pulse: false },
  error:    { label: 'Error',     bg: 'rgba(200,32,46,0.1)',   color: '#ff6b6b', pulse: false },
}

export default function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.sleeping

  return (
    <>
      <span className="status-pill" style={{ background: s.bg, color: s.color }}>
        <span className={`status-dot${s.pulse ? ' pulse' : ''}`} />
        {s.label}
      </span>
    </>
  )
}