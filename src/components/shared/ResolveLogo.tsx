export function ResolveLogo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          width="28"
          height="28"
          rx="7"
          fill={dark ? '#2563EB' : '#172554'}
        />
        <path
          d="M8.5 14.2L12.1 17.8L19.5 10.2"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20.5" cy="7.5" r="2" fill="#60A5FA" />
      </svg>
      <span
        className={`font-display text-[18px] font-bold tracking-tight ${
          dark ? 'text-white' : 'text-[#172554]'
        }`}
      >
        ResolveAI
      </span>
    </span>
  );
}
