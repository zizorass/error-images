// The Joey Koala mark: a minimal koala face drawn in caramel line-work.
export default function KoalaMark({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="14" cy="16" r="10" fill="url(#kg)" />
      <circle cx="50" cy="16" r="10" fill="url(#kg)" />
      <circle cx="14" cy="16" r="4.5" fill="#7a4a12" />
      <circle cx="50" cy="16" r="4.5" fill="#7a4a12" />
      <ellipse cx="32" cy="34" rx="20" ry="19" fill="url(#kg)" />
      <ellipse cx="32" cy="38" rx="6.5" ry="8" fill="#3b2415" />
      <circle cx="24" cy="30" r="2.6" fill="#241708" />
      <circle cx="40" cy="30" r="2.6" fill="#241708" />
      <circle cx="24.8" cy="29.2" r="0.9" fill="#f6ecd8" />
      <circle cx="40.8" cy="29.2" r="0.9" fill="#f6ecd8" />
      <defs>
        <linearGradient id="kg" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#f2c073" />
          <stop offset="1" stopColor="#c97b1e" />
        </linearGradient>
      </defs>
    </svg>
  )
}
