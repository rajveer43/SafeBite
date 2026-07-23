import { useRef } from "react";
import { motion, useInView } from "motion/react";

/* Circular safety-score gauge. Animates its arc once on scroll-in.
   `caption` sets the small line under the number (defaults to "/ 100"). */
export function ScoreRing({
  value,
  size = 112,
  caption = "/ 100",
}: {
  value: number;
  size?: number;
  caption?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const stroke = Math.round(size * 0.082);
  const radius = size / 2 - stroke / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const gradId = `ring-grad-${size}`;
  const filterId = `ring-glow-${size}`;

  return (
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 drop-shadow-xs">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#059669" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Outer track */}
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(16,185,129,0.12)" strokeWidth={stroke} />
      {/* Animated value arc */}
      <motion.circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        filter={`url(#${filterId})`}
        transform={`rotate(-90 ${center} ${center})`}
        initial={{ strokeDashoffset: circumference }}
        animate={isInView ? { strokeDashoffset: circumference * (1 - value / 100) } : {}}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
      {/* Value */}
      <text
        x={center}
        y={center - size * 0.03}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.32}
        fontWeight="800"
        fill="#0f172a"
        letterSpacing="-0.035em"
      >
        {value}
      </text>
      {/* Caption */}
      <text
        x={center}
        y={center + size * 0.22}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.095}
        fontWeight="600"
        fill="#64748b"
        letterSpacing="0.04em"
      >
        {caption}
      </text>
    </svg>
  );
}

