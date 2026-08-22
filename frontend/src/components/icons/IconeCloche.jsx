export default function IconeCloche({ className = 'h-6 w-6', active = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 3.4-.8 5.3-1.6 6.4A1 1 0 0 0 5.2 16h13.6a1 1 0 0 0 .8-1.6C18.8 13.3 18 11.4 18 8Z" />
      <path d="M9 17a3 3 0 0 0 6 0" />
      {active && <circle cx="12" cy="3" r="1.6" fill="currentColor" stroke="none" />}
    </svg>
  )
}
