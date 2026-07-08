// Stylized recreation of the real Joey Koala stand-up pouch: foil bag,
// gradient label with the stacked wordmark, flavour band, Great Taste
// roundel, and a clear window full of caramel popcorn. When real packet
// photography is supplied via `flavour.packetImage`, it renders the photo.
export default function PacketVisual({ flavour, className = '' }) {
  const { label, name, id } = flavour

  if (flavour.packetImage) {
    return (
      <img
        src={flavour.packetImage}
        alt={`${name} packet`}
        className={`object-contain drop-shadow-2xl ${className}`}
        loading="lazy"
      />
    )
  }

  const gid = `pk-${id}`
  const popcornBits = [
    [66, 236, 11], [88, 246, 13], [112, 240, 12], [134, 248, 10],
    [76, 258, 12], [100, 262, 14], [124, 258, 11], [58, 250, 9],
    [142, 262, 9], [90, 232, 8], [118, 230, 7],
  ]

  return (
    <svg viewBox="0 0 200 290" className={className} aria-label={`${name} packet`}>
      <defs>
        <linearGradient id={`${gid}-foil`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a3532" />
          <stop offset="0.12" stopColor="#181411" />
          <stop offset="0.5" stopColor="#26211d" />
          <stop offset="0.88" stopColor="#14100d" />
          <stop offset="1" stopColor="#403a36" />
        </linearGradient>
        <linearGradient id={`${gid}-label`} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor={label.top} />
          <stop offset="1" stopColor={label.bottom} />
        </linearGradient>
        <linearGradient id={`${gid}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(255,255,255,0)" />
          <stop offset="0.42" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="0.58" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <radialGradient id={`${gid}-corn`} cx="0.35" cy="0.3" r="1">
          <stop offset="0" stopColor="#e8b05e" />
          <stop offset="1" stopColor="#a5651c" />
        </radialGradient>
      </defs>

      {/* pouch body */}
      <path
        d="M42 26 L158 26 L164 44 C172 96 173 210 166 262 C164 276 152 284 100 284 C48 284 36 276 34 262 C27 210 28 96 36 44 Z"
        fill={`url(#${gid}-foil)`}
      />
      {/* crimped seal at the top */}
      <path d="M38 14 L162 14 L158 30 L42 30 Z" fill="#211c18" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <rect key={i} x={44 + i * 12} y="16" width="5" height="12" rx="2" fill="rgba(255,255,255,0.07)" />
      ))}
      {/* foil sheen */}
      <path
        d="M42 26 L158 26 L164 44 C172 96 173 210 166 262 C164 276 152 284 100 284 C48 284 36 276 34 262 C27 210 28 96 36 44 Z"
        fill={`url(#${gid}-sheen)`}
        opacity="0.35"
      />

      {/* clear window with popcorn */}
      <path
        d="M44 208 C82 200 118 200 156 208 C158 226 157 248 154 264 C150 274 142 278 100 278 C58 278 50 274 46 264 C43 248 42 226 44 208 Z"
        fill="#0c0805"
      />
      {popcornBits.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={`url(#${gid}-corn)`} />
          <circle cx={x - r * 0.4} cy={y - r * 0.35} r={r * 0.45} fill="#dfa452" />
          <circle cx={x + r * 0.35} cy={y - r * 0.2} r={r * 0.4} fill="#c07d2a" />
          <circle cx={x - r * 0.25} cy={y - r * 0.45} r={r * 0.16} fill="rgba(255,240,210,0.55)" />
        </g>
      ))}
      <path
        d="M44 208 C82 200 118 200 156 208 C158 226 157 248 154 264 C150 274 142 278 100 278 C58 278 50 274 46 264 C43 248 42 226 44 208 Z"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1.5"
      />

      {/* label */}
      <rect x="34" y="34" width="132" height="168" rx="3" fill={`url(#${gid}-label)`} />

      {/* top strapline */}
      <text x="100" y="48" textAnchor="middle" fill="rgba(255,255,255,0.92)" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="6" letterSpacing="1.6">
        HANDMADE &amp; AIR POPPED IN ENGLAND
      </text>

      {/* stacked wordmark — bold condensed serif like the real label */}
      <text x="100" y="88" textAnchor="middle" fill={label.word} fontFamily="Fraunces, Georgia, serif" fontWeight="900" fontSize="37" letterSpacing="4" transform="scale(1 1.08)" transform-origin="100 88">
        JOEY
      </text>
      <text x="100" y="124" textAnchor="middle" fill={label.word} fontFamily="Fraunces, Georgia, serif" fontWeight="900" fontSize="31" letterSpacing="1.5" transform="scale(1 1.08)" transform-origin="100 124">
        KOALA
      </text>

      {/* flavour band */}
      <rect x="34" y="134" width="132" height="36" fill={label.band} />
      <text x="100" y="149" textAnchor="middle" fill="#ffffff" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="12.5" letterSpacing="1">
        {name.toUpperCase()}
      </text>
      <text x="100" y="162" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontFamily="Outfit, sans-serif" fontWeight="600" fontSize="7" letterSpacing="2.4">
        GOURMET POPCORN
      </text>

      {/* award roundel */}
      <g transform="translate(56 186)">
        <circle r="13" fill="#14100c" />
        <circle r="13" fill="none" stroke="#d9b25e" strokeWidth="1.2" />
        <text y="-2" textAnchor="middle" fill="#f0e6ce" fontFamily="Outfit, sans-serif" fontStyle="italic" fontWeight="600" fontSize="5.4">great</text>
        <text y="4.5" textAnchor="middle" fill="#f0e6ce" fontFamily="Outfit, sans-serif" fontStyle="italic" fontWeight="600" fontSize="5.4">taste</text>
        <text y="10.5" textAnchor="middle" fill="#d9b25e" fontSize="5">★★</text>
      </g>

      {/* gold strapline */}
      <text x="112" y="184" textAnchor="middle" fill="#f2d38a" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="6" letterSpacing="0.6">
        {label.strap.split(' ').slice(0, 4).join(' ')}
      </text>
      <text x="112" y="192" textAnchor="middle" fill="#f2d38a" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="6" letterSpacing="0.6">
        {label.strap.split(' ').slice(4).join(' ')}
      </text>
    </svg>
  )
}
