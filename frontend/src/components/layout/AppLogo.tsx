interface AppLogoProps {
  className?: string;
}

/** Logotipo de la aplicación: robot amigable con globo de chat y antena. */
export function AppLogo({ className }: AppLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="2.8" r="1.5" fill="currentColor" />
      <path
        d="M12 4.3V6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.2 6.5h11.6A3.2 3.2 0 0 1 21 9.7v5.6a3.2 3.2 0 0 1-3.2 3.2h-7.6l-4 3v-3A3.2 3.2 0 0 1 3 15.3V9.7a3.2 3.2 0 0 1 3.2-3.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10.8" r="1.45" fill="currentColor" />
      <circle cx="15" cy="10.8" r="1.45" fill="currentColor" />
      <path
        d="M9.4 14.4a3.6 3.6 0 0 0 5.2 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
