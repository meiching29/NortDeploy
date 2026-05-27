const STATUS_CONFIG = {
  online:   { label: 'En línea',  bg: 'bg-green-500/10', text: 'text-green-400', pulse: true  },
  paused:   { label: 'Pausado',   bg: 'bg-ngold/10',     text: 'text-ngold',     pulse: false },
  sleeping: { label: 'Dormido',   bg: 'bg-white/[0.06]', text: 'text-ntext-muted', pulse: false },
  error:    { label: 'Error',     bg: 'bg-nred/10',       text: 'text-red-400',   pulse: false },
}

export default function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.sleeping

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full px-2.5 py-0.5 ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${s.pulse ? 'animate-pulse' : ''}`} />
      {s.label}
    </span>
  )
}
