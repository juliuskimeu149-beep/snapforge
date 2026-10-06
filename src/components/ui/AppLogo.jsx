import { memo, useId } from 'react'

// The SnapForge mark: a photo frame with a spark, on a blue → violet tile.
// Same artwork as public/favicon.svg and the installed-app icons.
function AppLogo({ size = 32, className }) {
  // useId output may contain characters that aren't valid in url(#...)
  const gradientId = `logo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b7cfa" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="116" fill={`url(#${gradientId})`} />
      <g
        fill="none"
        stroke="#fff"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="100" y="196" width="256" height="200" rx="40" />
        <path d="M128 368l74-74 56 56 28-28 50 50" />
      </g>
      <circle cx="178" cy="258" r="19" fill="#fff" />
      <path
        d="M388 88c7 38 18 49 56 56-38 7-49 18-56 56-7-38-18-49-56-56 38-7 49-18 56-56Z"
        fill="#fff"
      />
    </svg>
  )
}

// Memoised: the logo never changes, so it skips every editor re-render
export default memo(AppLogo)
